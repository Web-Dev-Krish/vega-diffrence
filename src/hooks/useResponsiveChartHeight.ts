import { useEffect, useState } from 'react';

type BreakpointKey = 'mobile' | 'tablet' | 'laptop' | 'desktop' | 'tv';

const getBreakpoint = (width: number): BreakpointKey => {
  if (width >= 1920) return 'tv';
  if (width >= 1280) return 'desktop';
  if (width >= 1024) return 'laptop';
  if (width >= 768) return 'tablet';
  return 'mobile';
};

const heights: Record<BreakpointKey, { vega: number; price: number; gauge: number }> = {
  mobile: { vega: 280, price: 260, gauge: 420 },
  tablet: { vega: 320, price: 300, gauge: 440 },
  laptop: { vega: 380, price: 340, gauge: 460 },
  desktop: { vega: 420, price: 380, gauge: 480 },
  tv: { vega: 520, price: 460, gauge: 560 },
};

export const useResponsiveChartHeight = () => {
  const [bp, setBp] = useState<BreakpointKey>(() => getBreakpoint(window.innerWidth));

  useEffect(() => {
    const handleResize = () => setBp(getBreakpoint(window.innerWidth));
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return heights[bp];
};
