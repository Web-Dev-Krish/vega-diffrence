import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Tick } from '../types/trading';

interface MetricCardProps {
  label: string;
  value: number;
  prevValue: number | null;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  colorClass?: string;
  icon: React.ReactNode;
}

export const MetricCard = ({
  label,
  value,
  prevValue,
  decimals = 2,
  prefix = '',
  suffix = '',
  colorClass = 'text-slate-100',
  icon,
}: MetricCardProps) => {
  const change = prevValue !== null ? value - prevValue : 0;
  const isUp = change > 0;
  const isDown = change < 0;
  const changePct = prevValue && prevValue !== 0 ? (change / Math.abs(prevValue)) * 100 : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-xs">{label}</span>
        <div className="scale-90 text-slate-500 sm:scale-100">{icon}</div>
      </div>
      <div className={`text-lg font-bold tabular-nums tracking-tight sm:text-xl lg:text-2xl ${colorClass}`}>
        {prefix}
        {value.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
        {suffix}
      </div>
      <div className="mt-1 flex items-center gap-1 text-[10px] font-medium sm:text-xs">
        {isUp ? (
          <ArrowUp size={12} className="text-emerald-400" />
        ) : isDown ? (
          <ArrowDown size={12} className="text-red-400" />
        ) : (
          <Minus size={12} className="text-slate-500" />
        )}
        <span
          className={
            isUp ? 'text-emerald-400' : isDown ? 'text-red-400' : 'text-slate-500'
          }
        >
          {change >= 0 ? '+' : ''}
          {change.toFixed(decimals)} ({changePct.toFixed(2)}%)
        </span>
      </div>
    </motion.div>
  );
};

export const SentimentCard = ({ value }: { value: number }) => {
  const label = value > 0.15 ? 'Bullish' : value < -0.15 ? 'Bearish' : 'Neutral';
  const color =
    label === 'Bullish' ? 'text-emerald-400' : label === 'Bearish' ? 'text-red-400' : 'text-yellow-400';
  const bg =
    label === 'Bullish'
      ? 'from-emerald-500/10 to-transparent'
      : label === 'Bearish'
      ? 'from-red-500/10 to-transparent'
      : 'from-yellow-500/10 to-transparent';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-br ${bg} p-4 shadow-sm`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Sentiment</span>
        <div className="text-slate-500">
          {label === 'Bullish' ? (
            <ArrowUp size={18} className="text-emerald-400" />
          ) : label === 'Bearish' ? (
            <ArrowDown size={18} className="text-red-400" />
          ) : (
            <Minus size={18} className="text-yellow-400" />
          )}
        </div>
      </div>
      <div className={`text-2xl font-bold sm:text-3xl ${color}`}>{label}</div>
      <div className="mt-1 text-[10px] text-slate-400 sm:text-xs">Vega-diff weighted oscillator</div>
    </motion.div>
  );
};
