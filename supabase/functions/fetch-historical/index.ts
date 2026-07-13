// Supabase Edge Function (Deno runtime)
// Purpose: Proxy Upstox's historical + intraday candle APIs (server-side, so
// the access token never touches the browser and CORS isn't a problem).
//
// Deploy: supabase functions deploy fetch-historical
// Call from frontend:
//   /fetch-historical?symbol=NIFTY&interval=1minute&days=5
//
// Upstox v2 only supports these native intervals: 1minute, day, week, month.
// There is NO native 5minute/15minute/1hour endpoint — the frontend requests
// 1minute candles and aggregates them into 5min/15min/1hour buckets itself
// (see src/lib/candleAggregation.ts). "1day" is requested directly.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const UPSTOX_KEYS: Record<string, string> = {
  NIFTY: 'NSE_INDEX|Nifty 50',
  BANKNIFTY: 'NSE_INDEX|Nifty Bank'
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function daysAgoISO(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url)
    const symbol = (url.searchParams.get('symbol') ?? 'NIFTY').toUpperCase()
    // 'base' interval actually fetched from Upstox: '1minute' or 'day'
    const requestedInterval = url.searchParams.get('interval') ?? '1minute'
    const days = Number(url.searchParams.get('days') ?? '5')

    const instrumentKey = UPSTOX_KEYS[symbol]
    if (!instrumentKey) return new Response(JSON.stringify({ error: 'Unknown symbol' }), { status: 400 })

    const { data: settingsRows, error: settingsErr } = await supabase
      .from('broker_settings')
      .select('*')
      .eq('broker', 'UPSTOX')
      .limit(1)
    if (settingsErr) throw settingsErr
    const settings = settingsRows?.[0]
    const token = settings?.upstox_access_token
    if (!token) throw new Error('Upstox access token missing in broker_settings')

    const headers = { Accept: 'application/json', Authorization: `Bearer ${token}` }

    // Upstox only serves 1minute candles natively (and only for the current
    // day via the intraday endpoint; older days need the historical endpoint
    // per-day). We stitch both together for a smooth multi-day 1-minute feed.
    const upstoxInterval = requestedInterval === 'day' ? 'day' : '1minute'

    let candles: any[] = []

    if (upstoxInterval === '1minute') {
      // Today's intraday 1-minute candles
      const intradayRes = await fetch(
        `https://api.upstox.com/v2/historical-candle/intraday/${encodeURIComponent(instrumentKey)}/1minute`,
        { headers }
      )
      const intradayJson = await intradayRes.json()
      if (intradayJson.status === 'success') candles.push(...intradayJson.data.candles)

      // Previous days' 1-minute candles (historical endpoint, one call covers a date range)
      const toDate = daysAgoISO(1)
      const fromDate = daysAgoISO(days)
      const histRes = await fetch(
        `https://api.upstox.com/v2/historical-candle/${encodeURIComponent(instrumentKey)}/1minute/${toDate}/${fromDate}`,
        { headers }
      )
      const histJson = await histRes.json()
      if (histJson.status === 'success') candles.push(...histJson.data.candles)
    } else {
      // Daily candles
      const toDate = todayISO()
      const fromDate = daysAgoISO(days)
      const histRes = await fetch(
        `https://api.upstox.com/v2/historical-candle/${encodeURIComponent(instrumentKey)}/day/${toDate}/${fromDate}`,
        { headers }
      )
      const histJson = await histRes.json()
      if (histJson.status === 'success') candles.push(...histJson.data.candles)
    }

    // Upstox candle format: [timestamp, open, high, low, close, volume, oi]
    // Normalize + sort ascending by time, dedupe by timestamp.
    const seen = new Set<string>()
    const normalized = candles
      .filter((c) => {
        if (seen.has(c[0])) return false
        seen.add(c[0])
        return true
      })
      .map((c) => ({
        time: c[0],
        open: c[1],
        high: c[2],
        low: c[3],
        close: c[4],
        volume: c[5]
      }))
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())

    return new Response(JSON.stringify({ ok: true, symbol, baseInterval: upstoxInterval, candles: normalized }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
