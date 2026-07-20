import { useEffect, useRef } from 'react';
import {
  createChart,
  LineSeries,
  AreaSeries,
  HistogramSeries,
  CandlestickSeries,
  BaselineSeries,
  type IChartApi,
  type ISeriesApi,
  type SeriesType,
  type LineData,
  type HistogramData,
  type CandlestickData,
  type Time,
  type UTCTimestamp,
  type DeepPartial,
  type ChartOptions,
} from 'lightweight-charts';

export type ChartSeries =
  | {
      type: 'Line';
      data: LineData<UTCTimestamp>[];
      options?: Record<string, unknown>;
    }
  | {
      type: 'Area';
      data: LineData<UTCTimestamp>[];
      options?: Record<string, unknown>;
    }
  | {
      type: 'Histogram';
      data: HistogramData<UTCTimestamp>[];
      options?: Record<string, unknown>;
    }
  | {
      type: 'Candlestick';
      data: CandlestickData<UTCTimestamp>[];
      options?: Record<string, unknown>;
    }
  | {
      type: 'Baseline';
      data: LineData<UTCTimestamp>[];
      options?: Record<string, unknown>;
    };

interface TradingViewChartProps {
  series: ChartSeries[];
  height?: number;
  options?: DeepPartial<ChartOptions>;
  className?: string;
  title?: string;
}

const defaultChartOptions: DeepPartial<ChartOptions> = {
  layout: {
    background: { color: 'transparent' },
    textColor: '#94a3b8',
    attributionLogo: false,
  },
  grid: {
    vertLines: { color: '#1e293b' },
    horzLines: { color: '#1e293b' },
  },
  crosshair: {
    mode: 1,
    vertLine: {
      color: '#475569',
      width: 1,
      style: 2,
      labelBackgroundColor: '#334155',
    },
    horzLine: {
      color: '#475569',
      width: 1,
      style: 2,
      labelBackgroundColor: '#334155',
    },
  },
  rightPriceScale: {
    borderColor: '#1e293b',
    scaleMargins: {
      top: 0.1,
      bottom: 0.1,
    },
  },
  timeScale: {
    borderColor: '#1e293b',
    timeVisible: true,
    secondsVisible: true,
    fixLeftEdge: true,
    fixRightEdge: true,
    rightOffset: 4,
    barSpacing: 8,
    minBarSpacing: 0.2,
    maxBarSpacing: 300,
  },
  handleScroll: {
    vertTouchDrag: false,
  },
  handleScale: {
    mouseWheel: false, // we implement custom high-sensitivity wheel zoom
    pinch: false,
    axisPressedMouseMove: {
      time: true,
      price: true,
    },
  },
};

const definitionMap = {
  Line: LineSeries,
  Area: AreaSeries,
  Histogram: HistogramSeries,
  Candlestick: CandlestickSeries,
  Baseline: BaselineSeries,
};

// Aggressive zoom multiplier. Values < 1 zoom in, > 1 zoom out.
const ZOOM_IN_FACTOR = 0.75;
const ZOOM_OUT_FACTOR = 1.35;

export const TradingViewChart = ({
  series,
  height = 320,
  options,
  className = '',
  title,
}: TradingViewChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRefs = useRef<ISeriesApi<SeriesType, Time>[]>([]);
  const mouseXRef = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      ...defaultChartOptions,
      ...options,
      width: containerRef.current.clientWidth,
      height,
    });
    chartRef.current = chart;

    // Apply series
    seriesRefs.current = series.map((s) => {
      const definition = definitionMap[s.type];
      const apiSeries = chart.addSeries(definition, s.options);
      apiSeries.setData(s.data);
      return apiSeries;
    });

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
          height,
        });
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRefs.current = [];
    };
  }, [series, height, options]);

  // Update data when series change without recreating chart
  useEffect(() => {
    if (!chartRef.current) return;
    series.forEach((s, i) => {
      const apiSeries = seriesRefs.current[i];
      if (apiSeries) {
        apiSeries.setData(s.data);
      }
    });
    chartRef.current.timeScale().fitContent();
  }, [series]);

  // Custom high-sensitivity wheel zoom centered on cursor.
  useEffect(() => {
    const container = containerRef.current;
    const chart = chartRef.current;
    if (!container || !chart) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseXRef.current = e.clientX - rect.left;
    };

    const handleWheel = (e: WheelEvent) => {
      // Only respond to pure vertical wheel events; ignore horizontal/page scroll.
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;

      // Prevent browser page zoom and default chart behavior.
      e.preventDefault();
      e.stopPropagation();

      const timeScale = chart.timeScale();
      const currentRange = timeScale.getVisibleLogicalRange();
      if (!currentRange) return;

      const direction = e.deltaY > 0 ? 'out' : 'in';
      const factor = direction === 'in' ? ZOOM_IN_FACTOR : ZOOM_OUT_FACTOR;

      // Use mouse X to center zoom on cursor.
      const mouseLogical = timeScale.coordinateToLogical(mouseXRef.current);
      if (mouseLogical === null) return;

      const currentSpan = currentRange.to - currentRange.from;
      const newSpan = currentSpan * factor;

      // Clamp span to avoid extreme over/under zoom.
      const minSpan = 3;
      const maxSpan = Math.max(1000, series[0]?.data.length * 2 || 1000);
      const clampedSpan = Math.max(minSpan, Math.min(maxSpan, newSpan));

      const ratio = (mouseLogical - currentRange.from) / currentSpan;
      const newFrom = mouseLogical - ratio * clampedSpan;
      const newTo = newFrom + clampedSpan;

      timeScale.setVisibleLogicalRange({ from: newFrom, to: newTo });
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('wheel', handleWheel);
    };
  }, [series]);

  return (
    <div className={`relative rounded-xl border border-slate-800 bg-slate-900/60 ${className}`}>
      {title && (
        <div className="absolute left-4 top-3 z-10 text-xs font-bold uppercase tracking-wide text-slate-300">
          {title}
        </div>
      )}
      <div ref={containerRef} className="w-full" style={{ height }} />
    </div>
  );
};
