import type { Candle, ConnectionConfig, Timeframe, UpstoxMarketQuoteData, UpstoxOptionChainData } from '../types/trading';
import { getTimeframeMs } from './candles';

const getUpstoxInterval = (tf: Timeframe): string => {
  const map: Record<string, string> = {
    '1min': '1minute',
    '5min': '5minute',
    '10min': '10minute',
    '15min': '15minute',
    '30min': '30minute',
    '1h': '1hour',
    '1d': '1day',
  };
  return map[tf] ?? '5minute';
};

const BASE_URL = 'https://api.upstox.com/v2';

export const fetchUpstoxOptionChain = async (
  config: ConnectionConfig
): Promise<UpstoxOptionChainData> => {
  const url = new URL(`${BASE_URL}/option/chain`);
  url.searchParams.set('instrument_key', config.symbol);
  if (config.expiryDate) url.searchParams.set('expiry_date', config.expiryDate);

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${config.analyticsToken}`,
      Accept: 'application/json',
      'Api-Version': '2.0',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upstox option chain error ${res.status}: ${text}`);
  }

  const json = await res.json();
  if (json.status === 'error' && json.errors?.length) {
    const messages = json.errors.map((e: { message?: string }) => e.message).join('; ');
    throw new Error(`Upstox option chain error: ${messages}`);
  }

  return json;
};

export const fetchUpstoxMarketQuote = async (
  config: ConnectionConfig,
  instrumentKeys: string[]
): Promise<UpstoxMarketQuoteData> => {
  const url = new URL(`${BASE_URL}/market-quote/quotes`);
  url.searchParams.set('instrument_key', instrumentKeys.join(','));

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${config.analyticsToken}`,
      Accept: 'application/json',
      'Api-Version': '2.0',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upstox market quote error ${res.status}: ${text}`);
  }

  const json = await res.json();
  if (json.status === 'error' && json.errors?.length) {
    const messages = json.errors.map((e: { message?: string }) => e.message).join('; ');
    throw new Error(`Upstox market quote error: ${messages}`);
  }

  return json;
};

export const fetchUpstoxCombinedTick = async (config: ConnectionConfig) => {
  // 1. Get option chain for the selected symbol/expiry.
  let chain = await fetchUpstoxOptionChain(config);
  if (!chain.data || chain.data.length === 0) {
    throw new Error('Option chain returned no data');
  }

  // 2. Find ATM strike (closest to spot from market quote of underlying).
  const underlyingQuote = await fetchUpstoxMarketQuote(config, [config.symbol]);
  const spotPrice = underlyingQuote.data?.[config.symbol]?.last_price ?? 0;
  if (!spotPrice) {
    throw new Error('Unable to read spot price from market quote');
  }

  // If expiry_date not provided, pick the nearest expiry from the chain.
  let chainData = chain.data ?? [];
  if (!config.expiryDate && chainData.length > 0) {
    const sortedExpirys = Array.from(new Set(chainData.map((d) => d.expiry_date))).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );
    const nearestExpiry = sortedExpirys.find((d) => new Date(d).getTime() >= new Date().getTime())
      ?? sortedExpirys[sortedExpirys.length - 1]
      ?? chainData[0].expiry_date;
    chainData = chainData.filter((d) => d.expiry_date === nearestExpiry);
  }

  if (chainData.length === 0) {
    throw new Error('Option chain returned no usable data');
  }

  const atmStrike = chainData.reduce((prev, curr) =>
    Math.abs(curr.strike_price - spotPrice) < Math.abs(prev.strike_price - spotPrice)
      ? curr
      : prev
  );

  // 3. Read CE/PE vega and OI from ATM strike.
  const ceVega = Number(atmStrike.ce?.vega ?? 0);
  const peVega = Number(atmStrike.pe?.vega ?? 0);

  const ceOi = Number(atmStrike.ce?.oi ?? 0);
  const peOi = Number(atmStrike.pe?.oi ?? 0);
  const ceChangeOi = Number(atmStrike.ce?.change_oi ?? 0);
  const peChangeOi = Number(atmStrike.pe?.change_oi ?? 0);

  const oi = Math.round(ceOi + peOi);
  const changeInOi = Math.round(ceChangeOi + peChangeOi);

  // 4. Compute VWAP (Upstox market quote does not expose VWAP directly for indices;
  //    we approximate last price as a fallback until you provide the exact field).
  //    For equities, `average_price` is often available. We attempt it here.
  const rawVwap =
    (underlyingQuote.data?.[config.symbol] as { average_price?: number })?.average_price ?? spotPrice;

  const vegaDiff = ceVega - peVega;
  // Simple sentiment model: positive vega diff -> call buying pressure -> bullish
  const sentiment = Math.max(-1, Math.min(1, vegaDiff / Math.max(ceVega + peVega, 1)));

  return {
    time: Date.now(),
    spotPrice,
    spotVwap: rawVwap,
    oi,
    changeInOi,
    ceOi,
    peOi,
    ceChangeOi,
    peChangeOi,
    ceVega,
    peVega,
    vegaDiff,
    sentiment,
  };
};

export interface UpstoxHistoricalCandleData {
  status: string;
  data?: {
    candles?: [string, number, number, number, number, number, number][];
  };
}

export const fetchUpstoxHistoricalCandles = async (
  config: ConnectionConfig,
  timeframe: Timeframe,
  count = 100
): Promise<Candle[]> => {
  // Upstox endpoint: /v2/historical-candle/{instrument_key}/{interval}/{to_date}/{from_date}
  const toDate = new Date();
  const fromDate = new Date(toDate.getTime() - count * getTimeframeMs(timeframe) * 1.2);

  const toDateStr = toDate.toISOString().split('T')[0];
  const fromDateStr = fromDate.toISOString().split('T')[0];

  const interval = getUpstoxInterval(timeframe);
  const url = new URL(
    `${BASE_URL}/historical-candle/${encodeURIComponent(config.symbol)}/${interval}/${toDateStr}/${fromDateStr}`
  );

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${config.analyticsToken}`,
      Accept: 'application/json',
      'Api-Version': '2.0',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upstox historical candle error ${res.status}: ${text}`);
  }

  const json: UpstoxHistoricalCandleData = await res.json();
  if (json.status === 'error' && (json as unknown as { errors?: { message?: string }[] }).errors?.length) {
    const messages = (json as unknown as { errors: { message?: string }[] }).errors
      .map((e) => e.message)
      .join('; ');
    throw new Error(`Upstox historical candle error: ${messages}`);
  }
  const candles = json.data?.candles ?? [];

  // Upstox candle format: [timestamp, open, high, low, close, volume, oi?]
  return candles.map((c) => ({
    time: new Date(c[0]).getTime(),
    open: Number(c[1]),
    high: Number(c[2]),
    low: Number(c[3]),
    close: Number(c[4]),
    vwap: Number(((c[1] + c[2] + c[3] + c[4]) / 4).toFixed(2)),
  }));
};
