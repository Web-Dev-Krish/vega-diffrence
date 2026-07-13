// Black-Scholes Vega calculation
// Vega = S * N'(d1) * sqrt(T), scaled per 1% change in IV

function stdNormPDF(x: number): number {
  return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-(x * x) / 2)
}

export function calcVega(
  spot: number,
  strike: number,
  riskFreeRate: number, // e.g. 0.07
  ivPercent: number,    // e.g. 15 (for 15%)
  daysToExpiry: number
): number {
  const sigma = ivPercent / 100
  const T = daysToExpiry / 365
  if (T <= 0 || sigma <= 0 || spot <= 0 || strike <= 0) return 0

  const d1 =
    (Math.log(spot / strike) + (riskFreeRate + (sigma * sigma) / 2) * T) /
    (sigma * Math.sqrt(T))

  const vega = (spot * stdNormPDF(d1) * Math.sqrt(T)) / 100
  return Number(vega.toFixed(4))
}

export function calcSentiment(
  vegaDiff: number,
  threshold = 2
): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
  if (vegaDiff > threshold) return 'BULLISH'
  if (vegaDiff < -threshold) return 'BEARISH'
  return 'NEUTRAL'
}
