import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

interface OIMetricCardProps {
  label: string;
  total: number;
  ceValue: number;
  peValue: number;
  prevTotal: number | null;
  icon: React.ReactNode;
  colorClass?: string;
}

const fmt = (n: number) => n.toLocaleString('en-IN', { maximumFractionDigits: 0 });

export const OIMetricCard = ({
  label,
  total,
  ceValue,
  peValue,
  prevTotal,
  icon,
  colorClass = 'text-slate-100',
}: OIMetricCardProps) => {
  const change = prevTotal !== null ? total - prevTotal : 0;
  const isUp = change > 0;
  const isDown = change < 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm"
    >
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-xs">{label}</span>
        <div className="scale-90 text-slate-500 sm:scale-100">{icon}</div>
      </div>
      <div className={`text-lg font-bold tabular-nums tracking-tight sm:text-xl ${colorClass}`}>{fmt(total)}</div>
      <div className="mt-1 flex items-center gap-1 text-[10px] font-medium text-slate-400">
        {isUp ? (
          <ArrowUp size={10} className="text-emerald-400" />
        ) : isDown ? (
          <ArrowDown size={10} className="text-red-400" />
        ) : (
          <Minus size={10} className="text-slate-500" />
        )}
        <span className={isUp ? 'text-emerald-400' : isDown ? 'text-red-400' : 'text-slate-500'}>
          {change >= 0 ? '+' : ''}
          {fmt(change)}
        </span>
      </div>
      <div className="mt-2 flex gap-2 text-[10px] sm:text-xs">
        <div className="flex-1 rounded bg-blue-500/10 px-1.5 py-1 text-blue-300 sm:px-2">
          CE {fmt(ceValue)}
        </div>
        <div className="flex-1 rounded bg-rose-500/10 px-1.5 py-1 text-rose-300 sm:px-2">
          PE {fmt(peValue)}
        </div>
      </div>
      <DiffRow ceValue={ceValue} peValue={peValue} />
    </motion.div>
  );
};

const DiffRow = ({ ceValue, peValue }: { ceValue: number; peValue: number }) => {
  const diff = ceValue - peValue;
  const ceGreater = diff > 0;
  const peGreater = diff < 0;

  const bgColor = ceGreater
    ? 'bg-red-500/10'
    : peGreater
    ? 'bg-emerald-500/10'
    : 'bg-slate-700/30';
  const textColor = ceGreater
    ? 'text-red-400'
    : peGreater
    ? 'text-emerald-400'
    : 'text-slate-400';

  return (
    <div className={`mt-2 rounded ${bgColor} px-2 py-1 text-center text-[10px] font-semibold sm:text-xs ${textColor}`}>
      CE - PE Diff: {diff > 0 ? '+' : ''}
      {fmt(diff)}
    </div>
  );
};
