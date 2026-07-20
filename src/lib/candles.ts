import type { Candle, Timeframe, VegaCandle } from '../types/trading';
import { TIMEFRAMES } from '../types/trading';

export const getTimeframeMs = (tf: Timeframe): number => {
  return TIMEFRAMES.find((t) => t.value === tf)?.ms ?? 5 * 60_000;
};

export const getTimeframeLabel = (tf: Timeframe): string => {
  return TIMEFRAMES.find((t) => t.value === tf)?.label ?? tf;
};

export const alignTimeToTimeframe = (timestamp: number, tf: Timeframe): number => {
  const ms = getTimeframeMs(tf);
  return Math.floor(timestamp / ms) * ms;
};

// Generate a synthetic candle history for simulation mode.
export const generateSyntheticCandles = (
  tf: Timeframe,
  count = 100,
  basePrice = 22450
): { price: Candle[]; vega: VegaCandle[] } => {
  const ms = getTimeframeMs(tf);
  const now = Date.now();
  const startTime = now - count * ms;

  const price: Candle[] = [];
  const vega: VegaCandle[] = [];

  let priceVal = basePrice;
  let ceVega = 12.5;
  let peVega = 11.8;

  // Scale volatility by timeframe.
  const volatility =
    tf === '1min'
      ? 8
      : tf === '5min'
      ? 18
      : tf === '10min'
      ? 28
      : tf === '15min'
      ? 36
      : tf === '30min'
      ? 52
      : tf === '1h'
      ? 78
      : 150;

  for (let i = 0; i < count; i++) {
    const time = startTime + i * ms;
    const open = priceVal;
    const change = (Math.random() - 0.48) * volatility;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.4;
    const low = Math.min(open, close) - Math.random() * volatility * 0.4;
    const vwap = (open + high + low + close) / 4 + (Math.random() - 0.5) * volatility * 0.15;

    price.push({
      time,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      vwap: Number(vwap.toFixed(2)),
    });

    ceVega = Math.max(2, ceVega + (Math.random() - 0.5) * (volatility / 80));
    peVega = Math.max(2, peVega + (Math.random() - 0.5) * (volatility / 80));

    vega.push({
      time,
      ceVega: Number(ceVega.toFixed(2)),
      peVega: Number(peVega.toFixed(2)),
      vegaDiff: Number((ceVega - peVega).toFixed(2)),
    });

    priceVal = close;
  }

  return { price, vega };
};

// Update the latest candle with a new close price (live tick simulation).
export const updateLatestCandle = (
  candles: Candle[],
  latestPrice: number,
  latestVwap: number
): Candle[] => {
  if (candles.length === 0) return candles;
  const next = [...candles];
  const last = { ...next[next.length - 1] };
  last.close = latestPrice;
  last.high = Math.max(last.high, latestPrice);
  last.low = Math.min(last.low, latestPrice);
  last.vwap = latestVwap;
  next[next.length - 1] = last;
  return next;
};

export const updateLatestVegaCandle = (
  candles: VegaCandle[],
  ceVega: number,
  peVega: number
): VegaCandle[] => {
  if (candles.length === 0) return candles;
  const next = [...candles];
  next[next.length - 1] = {
    ...next[next.length - 1],
    ceVega,
    peVega,
    vegaDiff: Number((ceVega - peVega).toFixed(2)),
  };
  return next;
};

// Add a new candle if the timeframe bucket has advanced.
export const maybeAddNewCandle = (
  candles: Candle[],
  tf: Timeframe,
  price: number,
  vwap: number
): Candle[] => {
  const ms = getTimeframeMs(tf);
  const last = candles[candles.length - 1];
  const currentBucket = alignTimeToTimeframe(Date.now(), tf);
  if (!last || currentBucket > last.time) {
    return [
      ...candles,
      {
        time: currentBucket,
        open: price,
        high: price,
        low: price,
        close: price,
        vwap,
      },
    ];
  }
  return candles;
};

export const maybeAddNewVegaCandle = (
  candles: VegaCandle[],
  tf: Timeframe,
  ceVega: number,
  peVega: number
): VegaCandle[] => {
  const ms = getTimeframeMs(tf);
  const last = candles[candles.length - 1];
  const currentBucket = alignTimeToTimeframe(Date.now(), tf);
  if (!last || currentBucket > last.time) {
    return [
      ...candles,
      {
        time: currentBucket,
        ceVega,
        peVega,
        vegaDiff: Number((ceVega - peVega).toFixed(2)),
      },
    ];
  }
  return candles;
};
