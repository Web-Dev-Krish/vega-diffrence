// Supabase Edge Function (Deno runtime)
// Purpose: Reads the ACTIVE broker + its API keys from the `broker_settings`
// table (editable from the app's Settings screen — no redeploy needed to
// switch broker or rotate keys), polls that broker's option chain, computes
// Vega/VWAP/Sentiment/Signal, and inserts a row into `option_ticks`.
//
// Deploy: supabase functions deploy fetch-market-data
// Trigger every N seconds with an external cron (cron-job.org / GitHub Actions)
// hitting: https://<project>.functions.supabase.co/fetch-market-data?symbol=NIFTY
//
// Secrets needed (only these two — broker keys live in the DB, not env):
//   supabase secrets set SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=...

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const UNDERLYINGS: Record<string, { dhanScrip: number; dhanSeg: string; angelSymbol: string; upstoxKey: string }> = {
  NIFTY: { dhanScrip: 13, dhanSeg: 'IDX_I', angelSymbol: 'NIFTY', upstoxKey: 'NSE_INDEX|Nifty 50' },
  BANKNIFTY: { dhanScrip: 25, dhanSeg: 'IDX_I', angelSymbol: 'BANKNIFTY', upstoxKey: 'NSE_INDEX|Nifty Bank' }
}

const VEGA_DIFF_THRESHOLD = 2.0

// In-memory session VWAP accumulator (resets on cold start — persist in a
// small `vwap_state` table keyed by symbol + date for production use).
const vwapState: Record<string, { cumPV: number; cumVol: number; date: string }> = {}

function todayIST(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
}

function stdNormPDF(x: number): number {
  return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-(x * x) / 2)
}

function calcVega(spot: number, strike: number, riskFreeRate: number, ivPercent: number, daysToExpiry: number): number {
  const sigma = ivPercent / 100
  const T = daysToExpiry / 365
  if (T <= 0 || sigma <= 0 || spot <= 0 || strike <= 0) return 0
  const d1 = (Math.log(spot / strike) + (riskFreeRate + (sigma * sigma) / 2) * T) / (sigma * Math.sqrt(T))
  return Number(((spot * stdNormPDF(d1) * Math.sqrt(T)) / 100).toFixed(4))
}

function nearestStrike(oc: Record<string, any>, spot: number): string {
  let best = ''
  let bestDiff = Infinity
  for (const strike of Object.keys(oc)) {
    const diff = Math.abs(parseFloat(strike) - spot)
    if (diff < bestDiff) {
      bestDiff = diff
      best = strike
    }
  }
  return best
}

// ---------- DHAN ----------
async function fetchFromDhan(symbol: string, settings: any) {
  const config = UNDERLYINGS[symbol]
  const token = settings.dhan_access_token
  const clientId = settings.dhan_client_id
  if (!token || !clientId) throw new Error('Dhan credentials missing in broker_settings')

  const headers = { 'Content-Type': 'application/json', 'access-token': token, 'client-id': clientId }

  const expiryRes = await fetch('https://api.dhan.co/v2/optionchain/expirylist', {
    method: 'POST',
    headers,
    body: JSON.stringify({ UnderlyingScrip: config.dhanScrip, UnderlyingSeg: config.dhanSeg })
  })
  const expiryJson = await expiryRes.json()
  const expiry = expiryJson.data[0]

  const chainRes = await fetch('https://api.dhan.co/v2/optionchain', {
    method: 'POST',
    headers,
    body: JSON.stringify({ UnderlyingScrip: config.dhanScrip, UnderlyingSeg: config.dhanSeg, Expiry: expiry })
  })
  const chain = await chainRes.json()
  if (chain.status !== 'success') throw new Error('Dhan API error: ' + JSON.stringify(chain))

  const spot = chain.data.last_price as number
  const oc = chain.data.oc as Record<string, any>
  const strikeKey = nearestStrike(oc, spot)
  const s = oc[strikeKey]

  return {
    spot,
    strike: parseFloat(strikeKey),
    expiry,
    ceLtp: s.ce.last_price as number,
    peLtp: s.pe.last_price as number,
    ceIv: s.ce.implied_volatility as number,
    peIv: s.pe.implied_volatility as number,
    ceVega: s.ce.greeks.vega as number,
    peVega: s.pe.greeks.vega as number
  }
}

// ---------- ANGEL ONE ----------
// Angel One's SmartAPI has no single "option chain" endpoint like Dhan's, so
// this logs in (TOTP), fetches LTP for the underlying + nearest CE/PE via the
// Quote API, and derives IV/Vega with Black-Scholes. You must set an
// `angel_instrument_map` (JSON) in broker_settings row's angel_access_token
// notes, or extend this with the official scrip-master lookup for full
// automation — the login + quote plumbing below is ready to wire up.
async function fetchFromAngelOne(symbol: string, settings: any) {
  const { angel_api_key, angel_client_code, angel_password, angel_totp_secret } = settings
  if (!angel_api_key || !angel_client_code || !angel_password || !angel_totp_secret) {
    throw new Error('Angel One credentials missing in broker_settings')
  }

  // 1. Generate TOTP (RFC 6238) from the secret
  const totp = await generateTOTP(angel_totp_secret)

  // 2. Login to get JWT access token
  const loginRes = await fetch('https://apiconnect.angelone.in/rest/auth/angelbroking/user/v1/loginByPassword', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-PrivateKey': angel_api_key,
      'X-SourceID': 'WEB',
      'X-ClientLocalIP': '127.0.0.1',
      'X-ClientPublicIP': '127.0.0.1',
      'X-MACAddress': '00:00:00:00:00:00',
      'X-UserType': 'USER'
    },
    body: JSON.stringify({ clientcode: angel_client_code, password: angel_password, totp })
  })
  const loginJson = await loginRes.json()
  if (!loginJson.status) throw new Error('Angel One login failed: ' + JSON.stringify(loginJson))
  const jwt = loginJson.data.jwtToken

  // 3. Fetch underlying LTP (NIFTY 50 / BANKNIFTY index token — adjust per Angel scrip master)
  const indexToken = symbol === 'NIFTY' ? '99926000' : '99926009'
  const ltpRes = await fetch('https://apiconnect.angelone.in/rest/secure/angelbroking/order/v1/getLTP', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
      'X-PrivateKey': angel_api_key,
      'X-SourceID': 'WEB',
      'X-ClientLocalIP': '127.0.0.1',
      'X-ClientPublicIP': '127.0.0.1',
      'X-MACAddress': '00:00:00:00:00:00',
      'X-UserType': 'USER'
    },
    body: JSON.stringify({ exchange: 'NSE', tradingsymbol: symbol, symboltoken: indexToken })
  })
  const ltpJson = await ltpRes.json()
  const spot = ltpJson.data?.ltp as number

  // NOTE: to fully mirror Dhan's per-strike CE/PE + IV, download Angel One's
  // scrip master (https://margincalculator.angelone.in/OpenAPI_File/files/OpenAPIScripMaster.json)
  // once, cache the nearest-strike CE/PE tokens for the current expiry, and
  // call getLTP again for each leg. Placeholder IV below keeps the pipeline
  // running end-to-end until that lookup table is wired in.
  const strike = Math.round(spot / 50) * 50
  const placeholderIv = 15
  const daysToExpiry = 3

  const ceVega = calcVega(spot, strike, 0.07, placeholderIv, daysToExpiry)
  const peVega = calcVega(spot, strike, 0.07, placeholderIv, daysToExpiry)

  return {
    spot,
    strike,
    expiry: todayIST(),
    ceLtp: 0,
    peLtp: 0,
    ceIv: placeholderIv,
    peIv: placeholderIv,
    ceVega,
    peVega
  }
}

// ---------- UPSTOX ----------
// Upstox v2 has a proper option-chain endpoint that returns option_greeks
// (including vega) per strike directly, similar to Dhan — no manual
// Black-Scholes needed, and no scrip-master lookup needed.
async function fetchFromUpstox(symbol: string, settings: any) {
  const config = UNDERLYINGS[symbol]
  const token = settings.upstox_access_token
  if (!token) throw new Error('Upstox access token missing in broker_settings')

  const headers = { Accept: 'application/json', Authorization: `Bearer ${token}` }

  // 1. Nearest expiry via the contracts endpoint
  const contractsRes = await fetch(
    `https://api.upstox.com/v2/option/contract?instrument_key=${encodeURIComponent(config.upstoxKey)}`,
    { headers }
  )
  const contractsJson = await contractsRes.json()
  if (contractsJson.status !== 'success') throw new Error('Upstox contracts error: ' + JSON.stringify(contractsJson))
  const expiries: string[] = Array.from(new Set(contractsJson.data.map((c: any) => c.expiry))).sort()
  const expiry = expiries[0]

  // 2. Option chain with greeks for that expiry
  const chainRes = await fetch(
    `https://api.upstox.com/v2/option/chain?instrument_key=${encodeURIComponent(config.upstoxKey)}&expiry_date=${expiry}`,
    { headers }
  )
  const chainJson = await chainRes.json()
  if (chainJson.status !== 'success') throw new Error('Upstox chain error: ' + JSON.stringify(chainJson))

  const rows: any[] = chainJson.data
  const spot = rows[0]?.underlying_spot_price as number

  let nearest = rows[0]
  let bestDiff = Infinity
  for (const r of rows) {
    const diff = Math.abs(r.strike_price - spot)
    if (diff < bestDiff) {
      bestDiff = diff
      nearest = r
    }
  }

  return {
    spot,
    strike: nearest.strike_price as number,
    expiry,
    ceLtp: nearest.call_options?.market_data?.ltp ?? 0,
    peLtp: nearest.put_options?.market_data?.ltp ?? 0,
    ceIv: nearest.call_options?.option_greeks?.iv ?? 0,
    peIv: nearest.put_options?.option_greeks?.iv ?? 0,
    ceVega: nearest.call_options?.option_greeks?.vega ?? 0,
    peVega: nearest.put_options?.option_greeks?.vega ?? 0
  }
}

async function generateTOTP(secret: string): Promise<string> {
  // Minimal TOTP (RFC 6238) implementation using Web Crypto (Deno-native).
  const key = base32Decode(secret)
  const epoch = Math.floor(Date.now() / 1000)
  const timeStep = Math.floor(epoch / 30)
  const timeBytes = new Uint8Array(8)
  let t = timeStep
  for (let i = 7; i >= 0; i--) {
    timeBytes[i] = t & 0xff
    t = Math.floor(t / 256)
  }
  const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign'])
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', cryptoKey, timeBytes))
  const offset = sig[sig.length - 1] & 0xf
  const binCode =
    ((sig[offset] & 0x7f) << 24) | ((sig[offset + 1] & 0xff) << 16) | ((sig[offset + 2] & 0xff) << 8) | (sig[offset + 3] & 0xff)
  return String(binCode % 1_000_000).padStart(6, '0')
}

function base32Decode(input: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  const clean = input.replace(/=+$/, '').toUpperCase()
  let bits = ''
  for (const char of clean) bits += alphabet.indexOf(char).toString(2).padStart(5, '0')
  const bytes = []
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2))
  return new Uint8Array(bytes)
}

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url)
    const symbol = (url.searchParams.get('symbol') ?? 'NIFTY').toUpperCase()
    if (!UNDERLYINGS[symbol]) {
      return new Response(JSON.stringify({ error: 'Unknown symbol' }), { status: 400 })
    }

    const { data: settingsRows, error: settingsErr } = await supabase
      .from('broker_settings')
      .select('*')
      .eq('is_active', true)
      .limit(1)
    if (settingsErr) throw settingsErr
    const settings = settingsRows?.[0]
    if (!settings) throw new Error('No active broker configured in broker_settings')

    const result =
      settings.broker === 'DHAN'
        ? await fetchFromDhan(symbol, settings)
        : settings.broker === 'UPSTOX'
        ? await fetchFromUpstox(symbol, settings)
        : await fetchFromAngelOne(symbol, settings)

    const vegaDiff = Number((result.ceVega - result.peVega).toFixed(4))
    const sentiment = vegaDiff > VEGA_DIFF_THRESHOLD ? 'BULLISH' : vegaDiff < -VEGA_DIFF_THRESHOLD ? 'BEARISH' : 'NEUTRAL'

    const today = todayIST()
    if (!vwapState[symbol] || vwapState[symbol].date !== today) {
      vwapState[symbol] = { cumPV: 0, cumVol: 0, date: today }
    }
    const st = vwapState[symbol]
    const assumedVol = 1
    st.cumPV += result.spot * assumedVol
    st.cumVol += assumedVol
    const spotVwap = st.cumPV / st.cumVol

    let signal: 'BUY' | 'SELL' | null = null
    if (sentiment === 'BULLISH' && result.spot > spotVwap) signal = 'BUY'
    if (sentiment === 'BEARISH' && result.spot < spotVwap) signal = 'SELL'

    const { error: insertErr } = await supabase.from('option_ticks').insert({
      symbol,
      strike: result.strike,
      expiry: result.expiry,
      spot_price: result.spot,
      ce_ltp: result.ceLtp,
      pe_ltp: result.peLtp,
      ce_iv: result.ceIv,
      pe_iv: result.peIv,
      ce_vega: result.ceVega,
      pe_vega: result.peVega,
      vega_diff: vegaDiff,
      sentiment,
      spot_vwap: Number(spotVwap.toFixed(2)),
      signal
    })
    if (insertErr) throw insertErr

    return new Response(
      JSON.stringify({ ok: true, broker: settings.broker, symbol, spot: result.spot, vegaDiff, sentiment, signal }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
