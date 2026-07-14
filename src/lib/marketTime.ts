// All chart timestamps must show NSE/Upstox market time (IST), not whatever
// timezone the viewer's PC/browser happens to be set to. Every formatter
// here explicitly pins timeZone: 'Asia/Kolkata' so a dashboard opened from
// any location shows the same, correct market time.

export function formatMarketTime(ts: string): string {
  return new Date(ts).toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

export function formatMarketDateTime(ts: string): string {
  return new Date(ts).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Returns the wall-clock IST minute-of-hour / hour-of-day for a UTC
// timestamp, independent of the browser's own timezone — used to bucket
// candles into 5min/15min/1hour buckets aligned to real NSE candle times
// (9:15, 9:20, 9:25 ... IST) instead of whatever the local machine thinks.
export function toISTParts(ts: string) {
  const d = new Date(ts)
  const istString = d.toLocaleString('en-US', { timeZone: 'Asia/Kolkata', hour12: false })
  const istDate = new Date(istString)
  return {
    year: istDate.getFullYear(),
    month: istDate.getMonth(),
    date: istDate.getDate(),
    hour: istDate.getHours(),
    minute: istDate.getMinutes()
  }
}
