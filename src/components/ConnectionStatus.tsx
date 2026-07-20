import { Activity, AlertCircle } from 'lucide-react';

interface ConnectionStatusProps {
  isLive: boolean;
  error: string | null;
}

export const ConnectionStatus = ({ isLive, error }: ConnectionStatusProps) => {
  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400">
        <AlertCircle size={14} />
        <span className="hidden sm:inline">Disconnected</span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
        isLive
          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
          : 'border-slate-600 bg-slate-800 text-slate-400'
      }`}
    >
      <Activity size={14} className={isLive ? 'animate-pulse' : ''} />
      <span className="hidden sm:inline">{isLive ? 'Live' : 'Paused'}</span>
    </div>
  );
};
