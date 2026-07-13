import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Scatter
} from 'recharts'
import type { OptionTick } from '../types'

function formatTime(ts: string) {
  const d = new Date(ts)
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function VwapChart({ ticks }: { ticks: OptionTick[] }) {
  const data = ticks.map((t) => ({
    time: formatTime(t.created_at),
    spot: t.spot_price,
    vwap: t.spot_vwap,
    buy: t.signal === 'BUY' ? t.spot_price : null,
    sell: t.signal === 'SELL' ? t.spot_price : null
  }))

  return (
    <div style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2530" />
          <XAxis dataKey="time" stroke="#8892a6" fontSize={11} />
          <YAxis stroke="#8892a6" fontSize={11} domain={['auto', 'auto']} />
          <Tooltip contentStyle={{ background: '#151a24', border: '1px solid #2a3140' }} />
          <Legend />
          <Line type="monotone" dataKey="spot" name="Spot" stroke="#38bdf8" dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="vwap" name="VWAP" stroke="#a78bfa" dot={false} strokeWidth={2} strokeDasharray="4 4" />
          <Scatter dataKey="buy" name="Buy Signal" fill="#22c55e" shape="triangle" />
          <Scatter dataKey="sell" name="Sell Signal" fill="#ef4444" shape="triangle" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
