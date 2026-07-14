import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Scatter,
  Brush
} from 'recharts'
import type { OptionTick } from '../types'
import { formatMarketTime } from '../lib/marketTime'

function LegendRow() {
  const items = [
    { color: '#38bdf8', label: 'Spot' },
    { color: '#a78bfa', label: 'VWAP' },
    { color: '#22c55e', label: 'Buy Signal' },
    { color: '#ef4444', label: 'Sell Signal' }
  ]
  return (
    <div style={{ display: 'flex', gap: 16, marginBottom: 6, fontSize: 12, color: '#c7cbd6', flexWrap: 'wrap' }}>
      {items.map((it) => (
        <div key={it.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: it.color, display: 'inline-block' }} />
          {it.label}
        </div>
      ))}
    </div>
  )
}

export default function VwapChart({ ticks }: { ticks: OptionTick[] }) {
  const data = ticks.map((t) => ({
    time: formatMarketTime(t.created_at),
    spot: t.spot_price,
    vwap: t.spot_vwap,
    buy: t.signal === 'BUY' ? t.spot_price : null,
    sell: t.signal === 'SELL' ? t.spot_price : null
  }))

  const allValues = data.flatMap((d) => [d.spot, d.vwap]).filter((v) => v != null) as number[]
  const min = allValues.length ? Math.min(...allValues) : 0
  const max = allValues.length ? Math.max(...allValues) : 1
  const pad = Math.max((max - min) * 0.15, 0.5)

  return (
    <div style={{ width: '100%' }}>
      <LegendRow />
      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2530" />
            <XAxis dataKey="time" stroke="#8892a6" fontSize={11} />
            <YAxis stroke="#8892a6" fontSize={11} domain={[min - pad, max + pad]} allowDataOverflow />
            <Tooltip contentStyle={{ background: '#151a24', border: '1px solid #2a3140' }} />
            <Line type="monotone" dataKey="spot" name="Spot" stroke="#38bdf8" dot={false} strokeWidth={2} isAnimationActive={false} />
            <Line
              type="monotone"
              dataKey="vwap"
              name="VWAP"
              stroke="#a78bfa"
              dot={false}
              strokeWidth={2}
              strokeDasharray="4 4"
              isAnimationActive={false}
            />
            <Scatter dataKey="buy" name="Buy Signal" fill="#22c55e" shape="triangle" />
            <Scatter dataKey="sell" name="Sell Signal" fill="#ef4444" shape="triangle" />
            {data.length > 10 && (
              <Brush dataKey="time" height={24} stroke="#38bdf8" fill="#0f131b" travellerWidth={8} tickFormatter={() => ''} />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div style={{ fontSize: 11, color: '#5a6274', marginTop: 4 }}>
        Zoom karne ke liye neeche wale slider ke handles ko drag karo.
      </div>
    </div>
  )
}
