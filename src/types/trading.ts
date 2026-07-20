export interface Tick {
  time: number;
  spotPrice: number;
  spotVwap: number;
  oi: number; // combined ATM CE + PE open interest
  changeInOi: number; // combined ATM CE + PE change in OI
  ceOi: number;
  peOi: number;
  ceChangeOi: number;
  peChangeOi: number;
  ceVega: number;
  peVega: number;
  vegaDiff: number;
  sentiment: number; // -1 to 1, negative bearish, positive bullish
}

export interface Candle {
  time: number; // ms timestamp
  open: number;
  high: number;
  low: number;
  close: number;
  vwap: number;
}

export interface VegaCandle {
  time: number;
  ceVega: number;
  peVega: number;
  vegaDiff: number;
}

export type Timeframe = '1min' | '5min' | '10min' | '15min' | '30min' | '1h' | '1d';

export const TIMEFRAMES: { value: Timeframe; label: string; upstoxInterval: string; ms: number }[] = [
  { value: '1min', label: '1m', upstoxInterval: '1minute', ms: 60_000 },
  { value: '5min', label: '5m', upstoxInterval: '5minute', ms: 5 * 60_000 },
  { value: '10min', label: '10m', upstoxInterval: '10minute', ms: 10 * 60_000 },
  { value: '15min', label: '15m', upstoxInterval: '15minute', ms: 15 * 60_000 },
  { value: '30min', label: '30m', upstoxInterval: '30minute', ms: 30 * 60_000 },
  { value: '1h', label: '1H', upstoxInterval: '1hour', ms: 60 * 60_000 },
  { value: '1d', label: '1D', upstoxInterval: '1day', ms: 24 * 60 * 60_000 },
];

export interface ConnectionConfig {
  mode: 'simulation' | 'upstox';
  analyticsToken: string; // Upstox Analytics Token used as Bearer token
  apiKey: string; // Upstox API Key
  apiSecret: string; // Upstox API Secret
  symbol: string; // e.g. NSE_INDEX|Nifty 50
  expiryDate: string; // YYYY-MM-DD
  refreshIntervalMs: number;
}

export interface UpstoxOptionChainData {
  status: string;
  data?: Array<{
    strike_price: number;
    expiry_date: string;
    pe?: {
      instrument_key: string;
      vega?: number;
      oi?: number;
      change_oi?: number;
      [key: string]: unknown;
    };
    ce?: {
      instrument_key: string;
      vega?: number;
      oi?: number;
      change_oi?: number;
      [key: string]: unknown;
    };
  }>;
}

export interface UpstoxMarketQuoteData {
  status: string;
  data?: Record<string, {
    last_price?: number;
    volume?: number;
    [key: string]: unknown;
  }>;
}

export type SentimentLabel = 'Bullish' | 'Bearish' | 'Neutral';

export const getSentimentLabel = (value: number): SentimentLabel => {
  if (value > 0.15) return 'Bullish';
  if (value < -0.15) return 'Bearish';
  return 'Neutral';
};

export const getSentimentColor = (value: number): string => {
  if (value > 0.15) return '#22c55e'; // green-500
  if (value < -0.15) return '#ef4444'; // red-500
  return '#eab308'; // yellow-500
};
