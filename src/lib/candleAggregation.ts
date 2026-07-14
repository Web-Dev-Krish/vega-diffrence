import { toISTParts } from './marketTime'

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

// Buckets 1-minute candles into N-minute candles, aligned to IST wall-clock
// time (9:15, 9:20, 9:25 ... like NSE/Upstox candles) — NOT the viewer's
// local browser timezone, which used to shift 1-hour buckets by up to 30
// minutes for anyone not physically in IST.
export function aggregateCandles(oneMinCandles: Candle[], timeframe: Timeframe): Candle[] {
  if (timeframe === '1day') return oneMinCandles // already daily from the API

  const bucketMinutes = BUCKET_MINUTES[timeframe]
  const buckets = new Map<string, Candle>()

  for (const c of oneMinCandles) {
    const ist = toISTParts(c.time)
    const totalMinutes = ist.hour * 60 + ist.minute
    const bucketStartTotalMinutes = Math.floor(totalMinutes / bucketMinutes) * bucketMinutes
    const bucketHour = Math.floor(bucketStartTotalMinutes / 60)
    const bucketMinute = bucketStartTotalMinutes % 60

    // Build the bucket key as an IST-labelled timestamp string so it's stable
    // and sorts correctly regardless of the viewer's own timezone.
    const key = `${ist.year}-${String(ist.month + 1).padStart(2, '0')}-${String(ist.date).padStart(2, '0')}T${String(
      bucketHour
    ).padStart(2, '0')}:${String(bucketMinute).padStart(2, '0')}:00+05:30`

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
