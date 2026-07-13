export type BrokerName = 'DHAN' | 'ANGELONE'

export interface BrokerSettings {
  id: number
  broker: BrokerName
  is_active: boolean
  dhan_client_id: string | null
  dhan_access_token: string | null
  angel_api_key: string | null
  angel_client_code: string | null
  angel_password: string | null
  angel_totp_secret: string | null
  angel_access_token: string | null
  developer_mode: boolean
  poll_interval_seconds: number
  max_points: number // 0 = unlimited
  updated_at: string
}

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
