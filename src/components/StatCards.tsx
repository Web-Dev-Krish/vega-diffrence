import type { OptionTick } from '../types'

function Card({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div
      style={{
        background: '#151a24',
        border: '1px solid #2a3140',
        borderRadius: 10,
        padding: '14px 18px',
        minWidth: 140
      }}
    >
      <div style={{ color: '#8892a6', fontSize: 12, marginBottom: 6 }}>{label}</div>
      <div style={{ color: color ?? '#e5e8ef', fontSize: 20, fontWeight: 600 }}>{value}</div>
    </div>
  )
}

export default function StatCards({ latest }: { latest: OptionTick | null }) {
  if (!latest) return <div style={{ color: '#8892a6' }}>Data ka wait ho raha hai...</div>

  const sentimentColor =
    latest.sentiment === 'BULLISH' ? '#22c55e' : latest.sentiment === 'BEARISH' ? '#ef4444' : '#8892a6'

  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
      <Card label="Spot Price" value={latest.spot_price.toFixed(2)} />
      <Card label="Spot VWAP" value={latest.spot_vwap.toFixed(2)} />
      <Card label="CE Vega" value={latest.ce_vega.toFixed(2)} color="#22c55e" />
      <Card label="PE Vega" value={latest.pe_vega.toFixed(2)} color="#ef4444" />
      <Card label="Vega Diff" value={latest.vega_diff.toFixed(2)} color="#f59e0b" />
      <Card label="Sentiment" value={latest.sentiment} color={sentimentColor} />
      {latest.signal && (
        <Card
          label="Live Signal"
          value={latest.signal}
          color={latest.signal === 'BUY' ? '#22c55e' : '#ef4444'}
        />
      )}
    </div>
  )
}
