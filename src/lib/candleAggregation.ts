export interface Candle {
  time: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export type Timeframe = '5min' | '15min' | '1hour' | '1day'

const BUCKET_MINUTES: Record<Exclude<Timeframe, '1day'>, number> = {
  '5min': 5,
  '15min': 15,
  '1hour': 60
}

// Buckets 1-minute candles into N-minute candles, aligned to clock time
// (e.g. 5min buckets start at :00, :05, :10 ... like every other platform).
export function aggregateCandles(oneMinCandles: Candle[], timeframe: Timeframe): Candle[] {
  if (timeframe === '1day') return oneMinCandles // already daily from the API

  const bucketMinutes = BUCKET_MINUTES[timeframe]
  const buckets = new Map<string, Candle>()

  for (const c of oneMinCandles) {
    const d = new Date(c.time)
    const bucketStartMinute = Math.floor(d.getMinutes() / bucketMinutes) * bucketMinutes
    const bucketDate = new Date(d)
    bucketDate.setMinutes(bucketStartMinute, 0, 0)
    const key = bucketDate.toISOString()

    const existing = buckets.get(key)
    if (!existing) {
      buckets.set(key, { time: key, open: c.open, high: c.high, low: c.low, close: c.close, volume: c.volume })
    } else {
      existing.high = Math.max(existing.high, c.high)
      existing.low = Math.min(existing.low, c.low)
      existing.close = c.close // candles arrive time-ordered, so last write wins
      existing.volume += c.volume
    }
  }

  return Array.from(buckets.values()).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
}
