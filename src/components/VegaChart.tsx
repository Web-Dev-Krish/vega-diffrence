import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Brush
} from 'recharts'
import type { OptionTick } from '../types'

function formatTime(ts: string) {
  const d = new Date(ts)
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

// Explicit legend instead of Recharts' built-in <Legend/> — the built-in one
// can render "undefined" in some data/prop combinations. This version can't.
function LegendRow() {
  const items = [
    { color: '#22c55e', label: 'CE Vega' },
    { color: '#ef4444', label: 'PE Vega' },
    { color: '#f59e0b', label: 'Vega Diff' }
  ]
  return (
    <div style={{ display: 'flex', gap: 16, marginBottom: 6, fontSize: 12, color: '#c7cbd6' }}>
      {items.map((it) => (
        <div key={it.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: it.color, display: 'inline-block' }} />
          {it.label}
        </div>
      ))}
    </div>
  )
}

export default function VegaChart({ ticks }: { ticks: OptionTick[] }) {
  const data = ticks.map((t) => ({
    time: formatTime(t.created_at),
    ceVega: t.ce_vega,
    peVega: t.pe_vega,
    vegaDiff: t.vega_diff
  }))

  // Tight, padded domain (instead of a wide default range) so small
  // real moves are actually visible instead of looking like a flat line.
  const allValues = data.flatMap((d) => [d.ceVega, d.peVega, d.vegaDiff]).filter((v) => v != null) as number[]
  const min = allValues.length ? Math.min(...allValues) : -1
  const max = allValues.length ? Math.max(...allValues) : 1
  const pad = Math.max((max - min) * 0.15, 0.5)

  return (
    <div style={{ width: '100%' }}>
      <LegendRow />
      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2530" />
            <XAxis dataKey="time" stroke="#8892a6" fontSize={11} />
            <YAxis stroke="#8892a6" fontSize={11} domain={[min - pad, max + pad]} allowDataOverflow />
            <Tooltip contentStyle={{ background: '#151a24', border: '1px solid #2a3140' }} />
            <ReferenceLine y={0} stroke="#3a4152" />
            <Line type="monotone" dataKey="ceVega" name="CE Vega" stroke="#22c55e" dot={false} strokeWidth={2} isAnimationActive={false} />
            <Line type="monotone" dataKey="peVega" name="PE Vega" stroke="#ef4444" dot={false} strokeWidth={2} isAnimationActive={false} />
            <Line type="monotone" dataKey="vegaDiff" name="Vega Diff" stroke="#f59e0b" dot={false} strokeWidth={2} isAnimationActive={false} />
            {data.length > 10 && (
              <Brush
                dataKey="time"
                height={24}
                stroke="#38bdf8"
                fill="#0f131b"
                travellerWidth={8}
                tickFormatter={() => ''}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div style={{ fontSize: 11, color: '#5a6274', marginTop: 4 }}>
        Zoom karne ke liye neeche wale slider ke handles ko drag karo.
      </div>
    </div>
  )
}
