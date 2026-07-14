import { useMemo } from 'react'
import type { OptionTick } from '../types'
import { aggregateCandles, ticksToOneMinCandles, type Candle, type Timeframe } from '../lib/candleAggregation'

// Builds candlestick data from the same option_ticks rows that are already
// being polled + saved every few seconds (spot_price + created_at) — no
// separate call to Upstox's historical-candle API. This means:
//   - one less thing that can fail/time out
//   - the chart only ever shows data since you started running the poller
//     (it can't show days/weeks of history the way the Upstox historical
//     endpoint could — that's the trade-off for not re-fetching separately)
export function useSpotCandles(ticks: OptionTick[], timeframe: Timeframe) {
  const candles: Candle[] = useMemo(() => {
    const oneMin = ticksToOneMinCandles(ticks)
    return aggregateCandles(oneMin, timeframe)
  }, [ticks, timeframe])

  return { candles, loading: false, error: null as string | null }
}
