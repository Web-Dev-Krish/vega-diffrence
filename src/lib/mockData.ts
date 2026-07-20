import type { Tick } from '../types/trading';

// Deterministic random walk for demo purposes.
export class MockDataEngine {
  private price = 22450;
  private vwapBias = 0;
  private ceVegaBase = 12.5;
  private peVegaBase = 11.8;
  private trend = 0;
  private oiBase = 1250000;
  private changeOiBase = 15000;

  next(): Tick {
    // Micro trend oscillation.
    this.trend += (Math.random() - 0.5) * 0.04;
    this.trend *= 0.92; // mean revert

    const change = (Math.random() - 0.48) * 3 + this.trend * 2;
    this.price += change;
    this.vwapBias += (change - this.vwapBias) * 0.05;

    const spotVwap = this.price - this.vwapBias + (Math.random() - 0.5) * 1.2;

    // Vega moves inversely-ish with spot jitter.
    this.ceVegaBase = Math.max(2, this.ceVegaBase + (Math.random() - 0.5) * 0.4);
    this.peVegaBase = Math.max(2, this.peVegaBase + (Math.random() - 0.5) * 0.4);

    const ceVega = Number(this.ceVegaBase.toFixed(2));
    const peVega = Number(this.peVegaBase.toFixed(2));
    const vegaDiff = Number((ceVega - peVega).toFixed(2));

    // OI random walk around a base level.
    this.oiBase = Math.max(500000, this.oiBase + (Math.random() - 0.5) * 5000);
    this.changeOiBase += (Math.random() - 0.5) * 2000;

    // Split combined OI into CE/PE components.
    const ceOi = Math.round(this.oiBase * (0.52 + (Math.random() - 0.5) * 0.08));
    const peOi = Math.round(this.oiBase - ceOi);
    const ceChangeOi = Math.round(this.changeOiBase * (0.55 + (Math.random() - 0.5) * 0.1));
    const peChangeOi = Math.round(this.changeOiBase - ceChangeOi);

    const oi = ceOi + peOi;
    const changeInOi = ceChangeOi + peChangeOi;

    // Sentiment derived from vega diff and price momentum.
    const sentiment = Math.max(-1, Math.min(1, vegaDiff * 0.15 + this.trend * 0.3));

    return {
      time: Date.now(),
      spotPrice: Number(this.price.toFixed(2)),
      spotVwap: Number(spotVwap.toFixed(2)),
      oi,
      changeInOi,
      ceOi,
      peOi,
      ceChangeOi,
      peChangeOi,
      ceVega,
      peVega,
      vegaDiff,
      sentiment: Number(sentiment.toFixed(2)),
    };
  }
}

export const initialHistory = (engine: MockDataEngine, count = 60): Tick[] => {
  const now = Date.now();
  const arr: Tick[] = [];
  for (let i = count; i >= 0; i--) {
    const tick = engine.next();
    arr.push({ ...tick, time: now - i * 1000 });
  }
  return arr;
};
