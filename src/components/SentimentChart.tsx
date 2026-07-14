import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Brush } from 'recharts'
import type { OptionTick } from '../types'

function formatTime(ts: string) {
  const d = new Date(ts)
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function sentimentScore(s: OptionTick['sentiment']) {
  if (s === 'BULLISH') return 1
  if (s === 'BEARISH') return -1
  return 0
}

export default function SentimentChart({ ticks }: { ticks: OptionTick[] }) {
  const data = ticks.map((t) => ({
    time: formatTime(t.created_at),
    score: sentimentScore(t.sentiment),
    sentiment: t.sentiment
  }))

  return (
    <div style={{ width: '100%', height: 220 }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="sentimentFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.5} />
              <stop offset="50%" stopColor="#8892a6" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.5} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2530" />
          <XAxis dataKey="time" stroke="#8892a6" fontSize={11} />
          <YAxis
            stroke="#8892a6"
            fontSize={11}
            domain={[-1.2, 1.2]}
            ticks={[-1, 0, 1]}
            tickFormatter={(v) => (v === 1 ? 'Bullish' : v === -1 ? 'Bearish' : 'Neutral')}
          />
          <Tooltip
            contentStyle={{ background: '#151a24', border: '1px solid #2a3140' }}
            formatter={(_value: number, _name: string, props: any) => [props.payload.sentiment, 'Sentiment']}
          />
          <ReferenceLine y={0} stroke="#3a4152" />
          <Area type="stepAfter" dataKey="score" stroke="#38bdf8" fill="url(#sentimentFill)" strokeWidth={2} isAnimationActive={false} />
          {data.length > 10 && (
            <Brush dataKey="time" height={20} stroke="#38bdf8" fill="#0f131b" travellerWidth={8} tickFormatter={() => ''} />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
