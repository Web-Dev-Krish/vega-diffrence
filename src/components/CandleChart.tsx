import { ResponsiveContainer, ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Brush } from 'recharts'
import type { Candle } from '../lib/candleAggregation'

function formatTime(ts: string) {
  const d = new Date(ts)
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

// Recharts has no native candlestick type, so we draw one ourselves: a thin
// wick (high→low) plus a filled body (open→close), colored green/red.
function CandleShape(props: any) {
  const { x, width, payload, yAxis } = props
  if (!yAxis || typeof yAxis.scale !== 'function') return null

  const scale = yAxis.scale
  const { open, high, low, close } = payload
  const isUp = close >= open

  const yHigh = scale(high)
  const yLow = scale(low)
  const yOpen = scale(open)
  const yClose = scale(close)
  const bodyTop = Math.min(yOpen, yClose)
  const bodyHeight = Math.max(Math.abs(yClose - yOpen), 1)
  const color = isUp ? '#22c55e' : '#ef4444'
  const cx = x + width / 2

  return (
    <g>
      <line x1={cx} x2={cx} y1={yHigh} y2={yLow} stroke={color} strokeWidth={1} />
      <rect x={x} y={bodyTop} width={width} height={bodyHeight} fill={color} />
    </g>
  )
}

export default function CandleChart({ candles }: { candles: Candle[] }) {
  const data = candles.map((c) => ({ ...c, label: formatTime(c.time) }))

  return (
    <div style={{ width: '100%', height: 380 }}>
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2530" />
          <XAxis dataKey="label" stroke="#8892a6" fontSize={10} minTickGap={30} />
          <YAxis stroke="#8892a6" fontSize={11} domain={['auto', 'auto']} />
          <Tooltip
            contentStyle={{ background: '#151a24', border: '1px solid #2a3140' }}
            formatter={(_v: number, _n: string, props: any) => {
              const p = props.payload
              return [`O ${p.open} H ${p.high} L ${p.low} C ${p.close}`, 'OHLC']
            }}
          />
          {/* invisible bar just to give the custom shape access to x/width/yAxis */}
          <Bar dataKey="high" shape={<CandleShape />} isAnimationActive={false} />
          {data.length > 15 && (
            <Brush dataKey="label" height={24} stroke="#38bdf8" fill="#0f131b" travellerWidth={8} tickFormatter={() => ''} />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
