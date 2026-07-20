import { useMemo } from 'react';
import { TradingViewChart, type ChartSeries } from './TradingViewChart';
import { TimeframeSelector } from './TimeframeSelector';
import type { VegaCandle, Timeframe } from '../types/trading';
import type { UTCTimestamp } from 'lightweight-charts';

interface VegaChartProps {
  candles: VegaCandle[];
  height?: number;
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
}

const createAutoscaleProvider = (paddingRatio = 0.08) => {
  return (original: () => { priceRange: { minValue: number; maxValue: number } | null } | null) => {
    const info = original();
    if (!info || !info.priceRange) return info;

    const { minValue, maxValue } = info.priceRange;
    const range = maxValue - minValue;
    const padding = range * paddingRatio;

    return {
      priceRange: {
        minValue: minValue - padding,
        maxValue: maxValue + padding,
      },
      margins: {
        above: 0.05,
        below: 0.05,
      },
    };
  };
};

export const VegaChart = ({
  candles,
  height = 360,
  timeframe,
  onTimeframeChange,
}: VegaChartProps) => {
  const series = useMemo<ChartSeries[]>(() => {
    const ceData = candles.map((c) => ({
      time: Math.floor(c.time / 1000) as UTCTimestamp,
      value: c.ceVega,
    }));
    const peData = candles.map((c) => ({
      time: Math.floor(c.time / 1000) as UTCTimestamp,
      value: c.peVega,
    }));
    const diffData = candles.map((c) => ({
      time: Math.floor(c.time / 1000) as UTCTimestamp,
      value: c.vegaDiff,
    }));

    const autoscaleInfoProvider = createAutoscaleProvider(0.08);

    return [
      {
        type: 'Line',
        data: diffData,
        options: {
          color: '#fbbf24',
          lineWidth: 2,
          lineStyle: 2,
          title: 'Vega Diff',
          priceLineVisible: false,
          autoscaleInfoProvider,
        },
      },
      {
        type: 'Line',
        data: peData,
        options: {
          color: '#fb7185',
          lineWidth: 2,
          title: 'PE Vega',
          priceLineVisible: false,
          autoscaleInfoProvider,
        },
      },
      {
        type: 'Line',
        data: ceData,
        options: {
          color: '#60a5fa',
          lineWidth: 2,
          title: 'CE Vega',
          priceLineVisible: false,
          autoscaleInfoProvider,
        },
      },
    ];
  }, [candles]);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 sm:p-4">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-300 sm:text-sm">
          Vega Monitor
        </h3>
        <TimeframeSelector value={timeframe} onChange={onTimeframeChange} />
      </div>
      <TradingViewChart
        series={series}
        height={height}
        options={{
          rightPriceScale: {
            autoScale: true,
            scaleMargins: {
              top: 0.05,
              bottom: 0.05,
            },
          },
        }}
      />
    </div>
  );
};
