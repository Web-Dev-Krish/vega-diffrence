export interface OptionTick {
  id: number
  created_at: string
  symbol: string
  strike: number
  expiry: string
  spot_price: number
  ce_ltp: number
  pe_ltp: number
  ce_iv: number
  pe_iv: number
  ce_vega: number
  pe_vega: number
  vega_diff: number
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL'
  spot_vwap: number
  signal: 'BUY' | 'SELL' | null
}
