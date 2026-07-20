import { Activity, Settings, TrendingUp } from 'lucide-react';
import type { ConnectionConfig } from '../types/trading';
import { ConnectionStatus } from './ConnectionStatus';

interface HeaderProps {
  config: ConnectionConfig;
  isLive: boolean;
  error: string | null;
  onSettings: () => void;
}

export const Header = ({ config, isLive, error, onSettings }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 xl:max-w-[1440px] 2xl:max-w-[1920px]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
            <TrendingUp size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight text-slate-100">
              Devsiy <span className="text-emerald-400">Trader&apos;s</span>
            </h1>
            <p className="text-xs font-medium text-slate-400">
              {config.symbol || 'NIFTY 50'} · {config.mode === 'simulation' ? 'Simulation' : 'Upstox Live'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <ConnectionStatus isLive={isLive} error={error} />
          <button
            onClick={onSettings}
            className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
          >
            <Settings size={16} />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
};
