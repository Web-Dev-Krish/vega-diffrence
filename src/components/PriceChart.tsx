import { useMemo } from 'react';
import { TradingViewChart, type ChartSeries } from './TradingViewChart';
import { TimeframeSelector } from './TimeframeSelector';
import type { Candle, Timeframe } from '../types/trading';
import type { UTCTimestamp } from 'lightweight-charts';

interface PriceChartProps {
  candles: Candle[];
  height?: number;
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
}

export const PriceChart = ({
  candles,
  height = 320,
  timeframe,
  onTimeframeChange,
}: PriceChartProps) => {
  const series = useMemo<ChartSeries[]>(() => {
    const candleData = candles.map((c) => ({
      time: Math.floor(c.time / 1000) as UTCTimestamp,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    const vwapData = candles.map((c) => ({
      time: Math.floor(c.time / 1000) as UTCTimestamp,
      value: c.vwap,
    }));

    return [
      {
        type: 'Line',
        data: vwapData,
        options: {
          color: '#818cf8',
          lineWidth: 2,
          lineStyle: 2,
          title: 'VWAP',
          priceLineVisible: false,
        },
      },
      {
        type: 'Candlestick',
        data: candleData,
        options: {
          upColor: '#22c55e',
          downColor: '#ef4444',
          borderUpColor: '#22c55e',
          borderDownColor: '#ef4444',
          wickUpColor: '#22c55e',
          wickDownColor: '#ef4444',
          title: 'Spot Price',
        },
      },
    ];
  }, [candles]);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 sm:p-4">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-300 sm:text-sm">
          Spot Price vs VWAP
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
