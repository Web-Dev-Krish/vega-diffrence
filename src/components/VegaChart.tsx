import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts'
import type { OptionTick } from '../types'

function formatTime(ts: string) {
  const d = new Date(ts)
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function VegaChart({ ticks }: { ticks: OptionTick[] }) {
  const data = ticks.map((t) => ({
    time: formatTime(t.created_at),
    ceVega: t.ce_vega,
    peVega: t.pe_vega,
    vegaDiff: t.vega_diff
  }))

  return (
    <div style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2530" />
          <XAxis dataKey="time" stroke="#8892a6" fontSize={11} />
          <YAxis stroke="#8892a6" fontSize={11} />
          <Tooltip contentStyle={{ background: '#151a24', border: '1px solid #2a3140' }} />
          <Legend />
          <ReferenceLine y={0} stroke="#3a4152" />
          <Line type="monotone" dataKey="ceVega" name="CE Vega" stroke="#22c55e" dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="peVega" name="PE Vega" stroke="#ef4444" dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="vegaDiff" name="Vega Diff" stroke="#f59e0b" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
