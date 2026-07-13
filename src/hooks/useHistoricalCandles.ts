import { useEffect, useState, useCallback } from 'react'
import { aggregateCandles, type Candle, type Timeframe } from '../lib/candleAggregation'

const DAYS_BY_TIMEFRAME: Record<Timeframe, number> = {
  '5min': 5,
  '15min': 5,
  '1hour': 15,
  '1day': 180
}

// Re-fetches on an interval so the current (still-forming) candle keeps
// updating, the same way other trading platforms keep the last candle live
// until it closes.
const REFRESH_MS = 30_000

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export function useHistoricalCandles(symbol: string, timeframe: Timeframe) {
  const [candles, setCandles] = useState<Candle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      const interval = timeframe === '1day' ? 'day' : '1minute'
      const days = DAYS_BY_TIMEFRAME[timeframe]

      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/fetch-historical?symbol=${symbol}&interval=${interval}&days=${days}`,
        { headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
      )
      const json = await res.json()
      if (json.error) throw new Error(json.error)

      const oneMin: Candle[] = json.candles
      setCandles(aggregateCandles(oneMin, timeframe))
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }, [symbol, timeframe])

  useEffect(() => {
    setLoading(true)
    load()
    const id = setInterval(load, REFRESH_MS)
    return () => clearInterval(id)
  }, [load])

  return { candles, loading, error, refresh: load }
}
