import type { Timeframe } from '../lib/candleAggregation'

const OPTIONS: { value: Timeframe; label: string }[] = [
  { value: '5min', label: '5 Min' },
  { value: '15min', label: '15 Min' },
  { value: '1hour', label: '1 Hour' },
  { value: '1day', label: '1 Day' }
]

export default function TimeframeSelector({
  value,
  onChange
}: {
  value: Timeframe
  onChange: (tf: Timeframe) => void
}) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          style={{
            padding: '5px 12px',
            borderRadius: 6,
            border: value === o.value ? '1px solid #38bdf8' : '1px solid #2a3140',
            background: value === o.value ? '#152233' : '#151a24',
            color: '#e5e8ef',
            fontSize: 12,
            cursor: 'pointer'
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
