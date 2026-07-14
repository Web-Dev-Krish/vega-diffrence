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
import { formatMarketTime } from '../lib/marketTime'

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

// Vega for index options realistically stays well under a few hundred. Any
// row outside this range is corrupt data (from the pre-fix bug, or a broker
// glitch) — drop it from the chart entirely instead of letting it stretch
// the Y-axis to the billions and flatten everything else into a straight line.
const SANE_VEGA_LIMIT = 1000

export default function VegaChart({ ticks }: { ticks: OptionTick[] }) {
  // Postgres `numeric` columns come back from supabase-js as STRINGS (to
  // avoid JS float rounding), not numbers. Coerce explicitly — without this,
  // filtering/min/max could silently behave wrong depending on row shape.
  const numeric = ticks.map((t) => ({
    time: t.created_at,
    ceVega: Number(t.ce_vega),
    peVega: Number(t.pe_vega),
    vegaDiff: Number(t.vega_diff)
  }))

  const clean = numeric.filter(
    (t) =>
      Number.isFinite(t.ceVega) &&
      Number.isFinite(t.peVega) &&
      Math.abs(t.ceVega) <= SANE_VEGA_LIMIT &&
      Math.abs(t.peVega) <= SANE_VEGA_LIMIT
  )
  const droppedCount = numeric.length - clean.length

  const data = clean.map((t) => ({
    time: formatMarketTime(t.time),
    ceVega: t.ceVega,
    peVega: t.peVega,
    vegaDiff: t.vegaDiff
  }))

  // Tight, padded domain (instead of a wide default range) so small
  // real moves are actually visible instead of looking like a flat line.
  const allValues = data.flatMap((d) => [d.ceVega, d.peVega, d.vegaDiff]).filter((v) => Number.isFinite(v))
  const min = allValues.length ? Math.min(...allValues) : -1
  const max = allValues.length ? Math.max(...allValues) : 1
  const pad = Math.max((max - min) * 0.15, 0.5)

  if (data.length === 0) {
    return (
      <div style={{ width: '100%' }}>
        <LegendRow />
        <div style={{ color: '#8892a6', fontSize: 13, padding: '30px 0', textAlign: 'center' }}>
          {droppedCount > 0
            ? `Is symbol ke saare ${droppedCount} loaded point corrupt (>1000 vega) nikle — nayi clean ticks aane ka wait karo, ya check karo ki edge function ka naya (validated) version is symbol ke liye deploy hua hai ya nahi.`
            : 'Abhi data ka wait ho raha hai...'}
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%' }}>
      <LegendRow />
      {droppedCount > 0 && (
        <div style={{ fontSize: 11, color: '#f59e0b', marginBottom: 6 }}>
          ⚠ {droppedCount} purane corrupt data point(s) chart se hide kiye gaye hain — DB se permanently
          hatane ke liye <code>0004_clean_bad_vega.sql</code> migration run karo.
        </div>
      )}
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
