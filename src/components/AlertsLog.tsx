import type { OptionTick } from '../types'
import { formatMarketTime } from '../lib/marketTime'

export default function AlertsLog({ ticks }: { ticks: OptionTick[] }) {
  const alerts = ticks.filter((t) => t.signal === 'BUY' || t.signal === 'SELL').slice(-100).reverse()

  return (
    <div style={{ maxHeight: 320, overflowY: 'auto' }}>
      {alerts.length === 0 && (
        <div style={{ color: '#8892a6', fontSize: 13, padding: '20px 0', textAlign: 'center' }}>
          Abhi tak koi Buy/Sell alert nahi aaya.
        </div>
      )}
      {alerts.map((t) => (
        <div
          key={t.id}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 12px',
            borderBottom: '1px solid #1f2530',
            fontSize: 13
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: 6,
                fontWeight: 700,
                fontSize: 11,
                color: t.signal === 'BUY' ? '#0b0f16' : '#fff',
                background: t.signal === 'BUY' ? '#22c55e' : '#ef4444'
              }}
            >
              {t.signal}
            </span>
            <span style={{ color: '#e5e8ef' }}>{t.symbol}</span>
            <span style={{ color: '#8892a6' }}>@ {t.spot_price.toFixed(2)}</span>
          </div>
          <div style={{ color: '#5a6274', fontSize: 12 }}>{formatMarketTime(t.created_at)}</div>
        </div>
      ))}
    </div>
  )
}
