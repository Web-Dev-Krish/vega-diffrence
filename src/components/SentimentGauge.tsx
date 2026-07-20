import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getSentimentColor, getSentimentLabel } from '../types/trading';
import type { Tick } from '../types/trading';

interface SentimentGaugeProps {
  value: number;
  latest: Tick;
  previous: Tick | null;
  height?: number;
}

type IndicatorState = 'bullish' | 'bearish' | 'neutral';

interface Indicator {
  name: string;
  state: IndicatorState;
  detail: string;
}

export const SentimentGauge = ({ value, latest, previous, height = 460 }: SentimentGaugeProps) => {
  const { rotation, label, color, indicators } = useMemo(() => {
    const rotation = value * 90;

    const priceChange = previous ? latest.spotPrice - previous.spotPrice : 0;

    const vegaDiff = latest.ceVega - latest.peVega;
    const vegaState: IndicatorState =
      vegaDiff > 0.15 ? 'bearish' : vegaDiff < -0.15 ? 'bullish' : 'neutral';

    const vwapDiff = latest.spotPrice - latest.spotVwap;
    const vwapState: IndicatorState =
      vwapDiff > 0.5 ? 'bullish' : vwapDiff < -0.5 ? 'bearish' : 'neutral';

    const momentumState: IndicatorState =
      priceChange > 0 ? 'bullish' : priceChange < 0 ? 'bearish' : 'neutral';

    const indicators: Indicator[] = [
      {
        name: 'Vega Balance',
        state: vegaState,
        detail: `CE ${latest.ceVega.toFixed(2)} / PE ${latest.peVega.toFixed(2)}`,
      },
      {
        name: 'VWAP Alignment',
        state: vwapState,
        detail: `Spot ${latest.spotPrice.toFixed(2)} / VWAP ${latest.spotVwap.toFixed(2)}`,
      },
      {
        name: 'Price Momentum',
        state: momentumState,
        detail: `${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}`,
      },
    ];

    return {
      rotation,
      label: getSentimentLabel(value),
      color: getSentimentColor(value),
      indicators,
    };
  }, [value, latest, previous]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 p-4"
      style={{ minHeight: height }}
    >
      <h3 className="mb-2 text-center text-xs font-bold uppercase tracking-wide text-slate-300 sm:text-sm">
        Sentiment Gauge
      </h3>
      <div className="relative my-2 flex h-24 items-center justify-center sm:h-28">
        {/* Gauge background arc */}
        <svg viewBox="0 0 200 110" className="h-full w-48 overflow-visible sm:w-56">
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth={18}
            strokeLinecap="round"
          />
          {/* Needle */}
          <g transform={`rotate(${rotation}, 100, 100)`}>
            <line x1="100" y1="100" x2="100" y2="28" stroke="#f8fafc" strokeWidth={3} strokeLinecap="round" />
            <circle cx="100" cy="100" r={6} fill="#f8fafc" />
          </g>
        </svg>
      </div>
      <div className="mb-4 text-center">
        <div className="text-xl font-bold sm:text-2xl" style={{ color }}>
          {label}
        </div>
        <div className="text-[10px] text-slate-400 sm:text-xs">Score {value.toFixed(2)}</div>
      </div>

      {/* Indicator Matrix */}
      <div className="mt-auto space-y-2">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs">Indicator Matrix</div>
        {indicators.map((ind) => (
          <IndicatorRow key={ind.name} indicator={ind} />
        ))}
      </div>
    </motion.div>
  );
};

const IndicatorRow = ({ indicator }: { indicator: Indicator }) => {
  const stateStyles = {
    bullish: {
      bar: 'bg-emerald-500',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      label: 'Bullish',
    },
    bearish: {
      bar: 'bg-red-500',
      bg: 'bg-red-500/10',
      text: 'text-red-400',
      label: 'Bearish',
    },
    neutral: {
      bar: 'bg-yellow-500',
      bg: 'bg-yellow-500/10',
      text: 'text-yellow-400',
      label: 'Neutral',
    },
  };

  const style = stateStyles[indicator.state];

  return (
    <div className={`rounded-lg ${style.bg} p-2 sm:p-2.5`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium text-slate-300 sm:text-xs">{indicator.name}</span>
        <span className={`text-[10px] font-bold sm:text-xs ${style.text}`}>{style.label}</span>
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full ${style.bar} transition-all duration-500`}
            style={{
              width:
                indicator.state === 'bullish' ? '75%' : indicator.state === 'bearish' ? '75%' : '40%',
              marginLeft: indicator.state === 'bearish' ? '25%' : '0%',
            }}
          />
        </div>
      </div>
      <div className="mt-1 text-[9px] text-slate-500 sm:text-[10px]">{indicator.detail}</div>
    </div>
  );
};
