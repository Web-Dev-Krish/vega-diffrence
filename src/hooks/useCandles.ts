import { useEffect, useRef, useState } from 'react';
import type { Candle, ConnectionConfig, Timeframe, VegaCandle } from '../types/trading';
import {
  alignTimeToTimeframe,
  generateSyntheticCandles,
  getTimeframeMs,
  updateLatestCandle,
  updateLatestVegaCandle,
} from '../lib/candles';
import { fetchUpstoxCombinedTick, fetchUpstoxHistoricalCandles } from '../lib/upstox';

const MAX_CANDLES = 120;

export interface CandlesState {
  priceCandles: Candle[];
  vegaCandles: VegaCandle[];
  isLive: boolean;
  error: string | null;
  lastUpdated: number | null;
}

export const useCandles = (config: ConnectionConfig, timeframe: Timeframe) => {
  const [state, setState] = useState<CandlesState>(() => {
    const { price, vega } = generateSyntheticCandles(timeframe, MAX_CANDLES);
    return {
      priceCandles: price,
      vegaCandles: vega,
      isLive: true,
      error: null,
      lastUpdated: Date.now(),
    };
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setState((prev) => ({ ...prev, isLive: true, error: null }));

    if (config.mode === 'simulation') {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const currentBucket = alignTimeToTimeframe(now, timeframe);

        setState((prev) => {
          let nextPrice = [...prev.priceCandles];
          let nextVega = [...prev.vegaCandles];

          const lastPrice = nextPrice[nextPrice.length - 1];
          const lastVega = nextVega[nextVega.length - 1];

          if (!lastPrice || currentBucket > lastPrice.time) {
            const prevClose = lastPrice?.close ?? 22450;
            nextPrice = [
              ...nextPrice,
              {
                time: currentBucket,
                open: prevClose,
                high: prevClose,
                low: prevClose,
                close: prevClose,
                vwap: prevClose,
              },
            ];
            nextVega = [
              ...nextVega,
              {
                time: currentBucket,
                ceVega: lastVega?.ceVega ?? 12.5,
                peVega: lastVega?.peVega ?? 11.8,
                vegaDiff: lastVega?.vegaDiff ?? 0.7,
              },
            ];
          }

          const last = nextPrice[nextPrice.length - 1];
          const volatility =
            timeframe === '1min'
              ? 3
              : timeframe === '5min'
              ? 6
              : timeframe === '10min'
              ? 9
              : timeframe === '15min'
              ? 12
              : timeframe === '30min'
              ? 18
              : timeframe === '1h'
              ? 26
              : 45;

          const newClose = last.close + (Math.random() - 0.48) * volatility;
          const newVwap = newClose + (Math.random() - 0.5) * volatility * 0.3;

          nextPrice = updateLatestCandle(nextPrice, Number(newClose.toFixed(2)), Number(newVwap.toFixed(2)));

          const lastV = nextVega[nextVega.length - 1];
          const newCeVega = Math.max(2, lastV.ceVega + (Math.random() - 0.5) * 0.3);
          const newPeVega = Math.max(2, lastV.peVega + (Math.random() - 0.5) * 0.3);
          nextVega = updateLatestVegaCandle(nextVega, Number(newCeVega.toFixed(2)), Number(newPeVega.toFixed(2)));

          const trimmedPrice = nextPrice.length > MAX_CANDLES ? nextPrice.slice(nextPrice.length - MAX_CANDLES) : nextPrice;
          const trimmedVega = nextVega.length > MAX_CANDLES ? nextVega.slice(nextVega.length - MAX_CANDLES) : nextVega;

          return {
            ...prev,
            priceCandles: trimmedPrice,
            vegaCandles: trimmedVega,
            lastUpdated: Date.now(),
            error: null,
          };
        });
      }, config.refreshIntervalMs);
    } else {
      const run = async () => {
        try {
          const [priceCandles, tick] = await Promise.all([
            fetchUpstoxHistoricalCandles(config, timeframe, MAX_CANDLES),
            fetchUpstoxCombinedTick(config),
          ]);

          const currentBucket = alignTimeToTimeframe(Date.now(), timeframe);

          const vegaCandles: VegaCandle[] = priceCandles.map((c, i) => {
            const prev = priceCandles[i - 1];
            const priceChange = prev ? c.close - prev.close : 0;
            const baseCe = 12.5 - priceChange * 0.02;
            const basePe = 11.8 + priceChange * 0.015;
            return {
              time: c.time,
              ceVega: Number(Math.max(2, baseCe).toFixed(2)),
              peVega: Number(Math.max(2, basePe).toFixed(2)),
              vegaDiff: Number((baseCe - basePe).toFixed(2)),
            };
          });

          const lastVega = vegaCandles[vegaCandles.length - 1];
          if (lastVega && lastVega.time === currentBucket) {
            lastVega.ceVega = tick.ceVega;
            lastVega.peVega = tick.peVega;
            lastVega.vegaDiff = tick.vegaDiff;
          }

          const updatedPrice = updateLatestCandle(priceCandles, tick.spotPrice, tick.spotVwap);

          setState((prev) => ({
            ...prev,
            priceCandles: updatedPrice,
            vegaCandles,
            lastUpdated: Date.now(),
            error: null,
          }));
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Unknown error';
          setState((prev) => ({ ...prev, error: msg, isLive: false }));
        }
      };

      run();
      intervalRef.current = setInterval(run, config.refreshIntervalMs);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [config, timeframe]);

  return state;
};
