// Supabase Edge Function (Deno runtime)
// Purpose: Poll Dhan Option Chain API every N seconds (triggered by external cron
// like cron-job.org or GitHub Actions hitting this URL), compute VWAP + sentiment
// + buy/sell signal, and insert a row into `option_ticks`.
//
// Deploy: supabase functions deploy fetch-dhan-data
// Secrets needed (set via `supabase secrets set`):
//   DHAN_ACCESS_TOKEN, DHAN_CLIENT_ID, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

const DHAN_ACCESS_TOKEN = Deno.env.get('DHAN_ACCESS_TOKEN')!
const DHAN_CLIENT_ID = Deno.env.get('DHAN_CLIENT_ID')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// Underlying config — NIFTY security_id = 13, segment IDX_I. BANKNIFTY = 25.
// Full list: https://dhanhq.co/docs/v2/instruments/
const UNDERLYINGS: Record<string, { scrip: number; seg: string }> = {
  NIFTY: { scrip: 13, seg: 'IDX_I' },
  BANKNIFTY: { scrip: 25, seg: 'IDX_I' }
}

const VEGA_DIFF_THRESHOLD = 2.0

// In-memory session VWAP accumulator (resets on cold start — for production
// persist this in a small `vwap_state` table keyed by symbol + date instead).
const vwapState: Record<string, { cumPV: number; cumVol: number; date: string }> = {}

function todayIST(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
}

async function getNearestExpiry(scrip: number, seg: string): Promise<string> {
  const res = await fetch('https://api.dhan.co/v2/optionchain/expirylist', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'access-token': DHAN_ACCESS_TOKEN,
      'client-id': DHAN_CLIENT_ID
    },
    body: JSON.stringify({ UnderlyingScrip: scrip, UnderlyingSeg: seg })
  })
  const json = await res.json()
  return json.data[0] // nearest expiry
}

async function getOptionChain(scrip: number, seg: string, expiry: string) {
  const res = await fetch('https://api.dhan.co/v2/optionchain', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'access-token': DHAN_ACCESS_TOKEN,
      'client-id': DHAN_CLIENT_ID
    },
    body: JSON.stringify({ UnderlyingScrip: scrip, UnderlyingSeg: seg, Expiry: expiry })
  })
  return res.json()
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

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url)
    const symbol = (url.searchParams.get('symbol') ?? 'NIFTY').toUpperCase()
    const config = UNDERLYINGS[symbol]
    if (!config) {
      return new Response(JSON.stringify({ error: 'Unknown symbol' }), { status: 400 })
    }

    const expiry = await getNearestExpiry(config.scrip, config.seg)
    const chain = await getOptionChain(config.scrip, config.seg, expiry)

    if (chain.status !== 'success') {
      return new Response(JSON.stringify({ error: 'Dhan API error', detail: chain }), { status: 502 })
    }

    const spot = chain.data.last_price as number
    const oc = chain.data.oc as Record<string, any>
    const strikeKey = nearestStrike(oc, spot)
    const strikeData = oc[strikeKey]

    const ceVega = strikeData.ce.greeks.vega as number
    const peVega = strikeData.pe.greeks.vega as number
    const ceLtp = strikeData.ce.last_price as number
    const peLtp = strikeData.pe.last_price as number
    const ceIv = strikeData.ce.implied_volatility as number
    const peIv = strikeData.pe.implied_volatility as number
    const vegaDiff = Number((ceVega - peVega).toFixed(4))

    const sentiment =
      vegaDiff > VEGA_DIFF_THRESHOLD ? 'BULLISH' : vegaDiff < -VEGA_DIFF_THRESHOLD ? 'BEARISH' : 'NEUTRAL'

    // --- Session VWAP using underlying LTP as proxy (Dhan option chain
    // response doesn't include underlying volume; for a true volume-weighted
    // VWAP, pull spot volume separately via Market Quote API and swap it in
    // here) ---
    const today = todayIST()
    if (!vwapState[symbol] || vwapState[symbol].date !== today) {
      vwapState[symbol] = { cumPV: 0, cumVol: 0, date: today }
    }
    const st = vwapState[symbol]
    const assumedVol = 1 // placeholder weight per tick; replace with real volume when available
    st.cumPV += spot * assumedVol
    st.cumVol += assumedVol
    const spotVwap = st.cumPV / st.cumVol

    // --- Buy/Sell signal: sentiment aligned + spot crossing VWAP ---
    let signal: 'BUY' | 'SELL' | null = null
    if (sentiment === 'BULLISH' && spot > spotVwap) signal = 'BUY'
    if (sentiment === 'BEARISH' && spot < spotVwap) signal = 'SELL'

    const { error } = await supabase.from('option_ticks').insert({
      symbol,
      strike: parseFloat(strikeKey),
      expiry,
      spot_price: spot,
      ce_ltp: ceLtp,
      pe_ltp: peLtp,
      ce_iv: ceIv,
      pe_iv: peIv,
      ce_vega: ceVega,
      pe_vega: peVega,
      vega_diff: vegaDiff,
      sentiment,
      spot_vwap: Number(spotVwap.toFixed(2)),
      signal
    })

    if (error) throw error

    return new Response(JSON.stringify({ ok: true, symbol, spot, vegaDiff, sentiment, signal }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
