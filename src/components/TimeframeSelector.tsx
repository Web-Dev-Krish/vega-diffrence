import { Clock } from 'lucide-react';
import { TIMEFRAMES, type Timeframe } from '../types/trading';

interface TimeframeSelectorProps {
  value: Timeframe;
  onChange: (tf: Timeframe) => void;
}

export const TimeframeSelector = ({ value, onChange }: TimeframeSelectorProps) => {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 p-1">
      <Clock size={14} className="ml-2 hidden text-slate-400 sm:block" />
      {TIMEFRAMES.map((tf) => (
        <button
          key={tf.value}
          onClick={() => onChange(tf.value)}
          className={`rounded-md px-2 py-1 text-[10px] font-semibold transition sm:px-2.5 sm:text-xs ${
            value === tf.value
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          {tf.label}
        </button>
      ))}
    </div>
  );
};
