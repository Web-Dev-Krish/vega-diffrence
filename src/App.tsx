import { useMemo, useState } from 'react';
import { Header } from './components/Header';
import { MetricCard, SentimentCard } from './components/MetricCard';
import { OIMetricCard } from './components/OIMetricCard';
import { PriceChart } from './components/PriceChart';
import { VegaChart } from './components/VegaChart';
import { SentimentGauge } from './components/SentimentGauge';
import { SettingsModal } from './components/SettingsModal';
import { useLiveData } from './hooks/useLiveData';
import { useCandles } from './hooks/useCandles';
import { useResponsiveChartHeight } from './hooks/useResponsiveChartHeight';
import type { ConnectionConfig, Timeframe } from './types/trading';
import {
  Activity,
  BarChart3,
  BookOpen,
  Gauge,
  Layers,
  RefreshCw,
  Scale,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { formatTime } from './lib/format';

const defaultConfig: ConnectionConfig = {
  mode: 'simulation',
  analyticsToken: '',
  apiKey: '',
  apiSecret: '',
  symbol: 'NSE_INDEX|Nifty 50',
  expiryDate: '',
  refreshIntervalMs: 1000,
};

function App() {
  const [config, setConfig] = useState<ConnectionConfig>(defaultConfig);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [priceTimeframe, setPriceTimeframe] = useState<Timeframe>('5min');
  const [vegaTimeframe, setVegaTimeframe] = useState<Timeframe>('5min');

  const { history: tickHistory, latest, isLive, error, lastUpdated } = useLiveData(config);
  const { priceCandles: priceCandlesForChart } = useCandles(config, priceTimeframe);
  const { vegaCandles: vegaCandlesForChart } = useCandles(config, vegaTimeframe);

  const { vega: vegaHeight, price: priceHeight, gauge: gaugeHeight } = useResponsiveChartHeight();

  const previous = useMemo(() => {
    if (tickHistory.length < 2) return null;
    return tickHistory[tickHistory.length - 2];
  }, [tickHistory]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Header
        config={config}
        isLive={isLive}
        error={error}
        onSettings={() => setSettingsOpen(true)}
      />

      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-5 xl:max-w-[1440px] 2xl:max-w-[1920px]">
        {error && (
          <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <strong>Connection error:</strong> {error}. Switch to Simulation mode or check your Upstox access
            token.
          </div>
        )}

        {/* Metric cards */}
        {latest && (
          <div className="mb-5 grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8">
            <MetricCard
              label="Spot Price"
              value={latest.spotPrice}
              prevValue={previous?.spotPrice ?? latest.spotPrice}
              decimals={2}
              icon={<TrendingUp size={18} />}
              colorClass="text-emerald-400"
            />
            <MetricCard
              label="Spot VWAP"
              value={latest.spotVwap}
              prevValue={previous?.spotVwap ?? latest.spotVwap}
              decimals={2}
              icon={<Scale size={18} />}
              colorClass="text-indigo-400"
            />
            <OIMetricCard
              label="OI"
              total={latest.oi}
              ceValue={latest.ceOi}
              peValue={latest.peOi}
              prevTotal={previous?.oi ?? latest.oi}
              icon={<BookOpen size={18} />}
              colorClass="text-cyan-400"
            />
            <OIMetricCard
              label="Change in OI"
              total={latest.changeInOi}
              ceValue={latest.ceChangeOi}
              peValue={latest.peChangeOi}
              prevTotal={previous?.changeInOi ?? latest.changeInOi}
              icon={<RefreshCw size={18} />}
              colorClass={latest.changeInOi >= 0 ? 'text-emerald-400' : 'text-red-400'}
            />
            <MetricCard
              label="CE Vega"
              value={latest.ceVega}
              prevValue={previous?.ceVega ?? latest.ceVega}
              decimals={2}
              icon={<BarChart3 size={18} />}
              colorClass="text-blue-400"
            />
            <MetricCard
              label="PE Vega"
              value={latest.peVega}
              prevValue={previous?.peVega ?? latest.peVega}
              decimals={2}
              icon={<BarChart3 size={18} />}
              colorClass="text-rose-400"
            />
            <MetricCard
              label="Vega Diff"
              value={latest.vegaDiff}
              prevValue={previous?.vegaDiff ?? latest.vegaDiff}
              decimals={2}
              icon={<Layers size={18} />}
              colorClass={latest.vegaDiff >= 0 ? 'text-emerald-400' : 'text-red-400'
              }
            />
            <SentimentCard value={latest.sentiment} />
          </div>
        )}

        {/* Charts */}
        <div className="grid gap-4 md:gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <VegaChart
              candles={vegaCandlesForChart}
              height={vegaHeight}
              timeframe={vegaTimeframe}
              onTimeframeChange={setVegaTimeframe}
            />
          </div>
          <div className="lg:col-span-1">
            {latest && (
              <SentimentGauge
                value={latest.sentiment}
                latest={latest}
                previous={previous}
                height={gaugeHeight}
              />
            )}
          </div>
        </div>

        <div className="mt-4 md:mt-5">
          <PriceChart
            candles={priceCandlesForChart}
            height={priceHeight}
            timeframe={priceTimeframe}
            onTimeframeChange={setPriceTimeframe}
          />
        </div>

        {/* Footer info */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Wallet size={14} />
              Symbol: <span className="text-slate-300">{config.symbol}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Activity size={14} />
              Mode: <span className="text-slate-300">{config.mode === 'simulation' ? 'Simulation' : 'Upstox'}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Gauge size={14} />
              Refresh: <span className="text-slate-300">{config.refreshIntervalMs / 1000}s</span>
            </span>
          </div>
          <div>Last updated: {lastUpdated ? formatTime(lastUpdated) : '--:--:--'}</div>
        </div>
      </main>

      <SettingsModal
        isOpen={settingsOpen}
        config={config}
        onClose={() => setSettingsOpen(false)}
        onSave={setConfig}
      />
    </div>
  );
}

export default App;
