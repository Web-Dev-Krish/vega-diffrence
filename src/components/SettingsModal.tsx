import { useState, useEffect } from 'react';
import { X, Key, Wifi, Clock, CircleDollarSign, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ConnectionConfig } from '../types/trading';

interface SettingsModalProps {
  isOpen: boolean;
  config: ConnectionConfig;
  onClose: () => void;
  onSave: (config: ConnectionConfig) => void;
}

export const SettingsModal = ({ isOpen, config, onClose, onSave }: SettingsModalProps) => {
  const [draft, setDraft] = useState<ConnectionConfig>(config);

  useEffect(() => {
    if (isOpen) setDraft(config);
  }, [isOpen, config]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-100">Connection Settings</h2>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <Wifi size={14} /> Data Source
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setDraft({ ...draft, mode: 'simulation' })}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                      draft.mode === 'simulation'
                        ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                        : 'border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    Simulation
                  </button>
                  <button
                    onClick={() => setDraft({ ...draft, mode: 'upstox' })}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                      draft.mode === 'upstox'
                        ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-400'
                        : 'border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    Upstox Live
                  </button>
                </div>
              </div>

              {draft.mode === 'upstox' && (
                <>
                  <div>
                    <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <Key size={14} /> Analytics Token
                    </label>
                    <input
                      type="password"
                      value={draft.analyticsToken}
                      onChange={(e) => setDraft({ ...draft, analyticsToken: e.target.value })}
                      placeholder="eyJhbGciOi..."
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-indigo-500"
                    />
                    <p className="mt-1 text-[10px] text-slate-500">
                      Used as Bearer token for live market-data API calls.
                    </p>
                  </div>

                  <div>
                    <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <Lock size={14} /> API Key
                    </label>
                    <input
                      type="password"
                      value={draft.apiKey}
                      onChange={(e) => setDraft({ ...draft, apiKey: e.target.value })}
                      placeholder="Your Upstox API Key"
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <Lock size={14} /> API Secret
                    </label>
                    <input
                      type="password"
                      value={draft.apiSecret}
                      onChange={(e) => setDraft({ ...draft, apiSecret: e.target.value })}
                      placeholder="Your Upstox API Secret"
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-indigo-500"
                    />
                    <p className="mt-1 text-[10px] text-slate-500">
                      API Key + Secret are stored for future OAuth flow support. Currently Analytics Token is used directly.
                    </p>
                  </div>

                  <div>
                    <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <CircleDollarSign size={14} /> Instrument Key
                    </label>
                    <input
                      type="text"
                      value={draft.symbol}
                      onChange={(e) => setDraft({ ...draft, symbol: e.target.value })}
                      placeholder="NSE_INDEX|Nifty 50"
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={draft.expiryDate}
                      onChange={(e) => setDraft({ ...draft, expiryDate: e.target.value })}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
                    />
                    <p className="mt-1 text-[10px] text-slate-500">
                      Leave empty to auto-select the nearest expiry from option chain.
                    </p>
                  </div>
                </>
              )}

              <div>
                <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <Clock size={14} /> Refresh Interval
                </label>
                <select
                  value={draft.refreshIntervalMs}
                  onChange={(e) => setDraft({ ...draft, refreshIntervalMs: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
                >
                  <option value={1000}>1 second</option>
                  <option value={2000}>2 seconds</option>
                  <option value={5000}>5 seconds</option>
                  <option value={10000}>10 seconds</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onSave(draft);
                  onClose();
                }}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                Save Settings
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
