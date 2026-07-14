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

const BUCKET_MINUTES: Record<Timeframe, number> = {
  '5min': 5,
  '15min': 15,
  '1hour': 60,
  '1day': 1440
}

// Buckets 1-minute candles into N-minute candles, aligned to IST wall-clock
// time (9:15, 9:20, 9:25 ... like NSE/Upstox candles) — NOT the viewer's
// local browser timezone, which used to shift 1-hour buckets by up to 30
// minutes for anyone not physically in IST.
export function aggregateCandles(oneMinCandles: Candle[], timeframe: Timeframe): Candle[] {
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

// Builds 1-minute OHLC candles straight from raw spot-price ticks that are
// already being polled + saved into option_ticks every few seconds. This
// avoids a separate call to Upstox's historical-candle API entirely — the
// chart is built purely from data the app was going to save anyway.
export function ticksToOneMinCandles(
  ticks: { created_at: string; spot_price: number }[]
): Candle[] {
  const oneMin = ticks.map((t) => ({
    time: t.created_at,
    open: t.spot_price,
    high: t.spot_price,
    low: t.spot_price,
    close: t.spot_price,
    volume: 1
  }))
  return aggregateCandlesToMinute(oneMin)
}

// Internal: bucket raw ticks into true 1-minute OHLC (aggregateCandles above
// needs a Timeframe key, so this does the same IST-aligned bucketing at a
// fixed 1-minute size without adding '1min' to the public Timeframe type).
function aggregateCandlesToMinute(rawTicks: Candle[]): Candle[] {
  const buckets = new Map<string, Candle>()
  for (const c of rawTicks) {
    const ist = toISTParts(c.time)
    const key = `${ist.year}-${String(ist.month + 1).padStart(2, '0')}-${String(ist.date).padStart(2, '0')}T${String(
      ist.hour
    ).padStart(2, '0')}:${String(ist.minute).padStart(2, '0')}:00+05:30`
    const existing = buckets.get(key)
    if (!existing) {
      buckets.set(key, { time: key, open: c.open, high: c.high, low: c.low, close: c.close, volume: c.volume })
    } else {
      existing.high = Math.max(existing.high, c.high)
      existing.low = Math.min(existing.low, c.low)
      existing.close = c.close
      existing.volume += c.volume
    }
  }
  return Array.from(buckets.values()).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
}
