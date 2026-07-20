import { useCallback, useEffect, useRef, useState } from 'react';
import type { ConnectionConfig, Tick } from '../types/trading';
import { fetchUpstoxCombinedTick } from '../lib/upstox';
import { initialHistory, MockDataEngine } from '../lib/mockData';

const MAX_HISTORY = 120;

export interface LiveDataState {
  history: Tick[];
  latest: Tick | null;
  isLive: boolean;
  error: string | null;
  lastUpdated: number | null;
}

export const useLiveData = (config: ConnectionConfig) => {
  const [state, setState] = useState<LiveDataState>(() => {
    const engine = new MockDataEngine();
    const history = initialHistory(engine, MAX_HISTORY);
    return {
      history,
      latest: history[history.length - 1],
      isLive: true,
      error: null,
      lastUpdated: Date.now(),
    };
  });

  const engineRef = useRef<MockDataEngine>(new MockDataEngine());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pushTick = useCallback((tick: Tick) => {
    setState((prev) => {
      const nextHistory = [...prev.history, tick];
      if (nextHistory.length > MAX_HISTORY) nextHistory.shift();
      return {
        ...prev,
        history: nextHistory,
        latest: tick,
        isLive: true,
        lastUpdated: Date.now(),
        error: null,
      };
    });
  }, []);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    setState((prev) => ({ ...prev, isLive: true, error: null }));

    if (config.mode === 'simulation') {
      intervalRef.current = setInterval(() => {
        const tick = engineRef.current.next();
        pushTick(tick);
      }, config.refreshIntervalMs);
    } else {
      // Real Upstox polling.
      const run = async () => {
        try {
          const tick = await fetchUpstoxCombinedTick(config);
          pushTick(tick);
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
  }, [config, pushTick]);

  return state;
};
