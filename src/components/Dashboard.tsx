import { useState } from 'react'
import { useOptionData } from '../hooks/useOptionData'
import StatCards from './StatCards'
import VegaChart from './VegaChart'
import VwapChart from './VwapChart'

export default function Dashboard() {
  const [symbol, setSymbol] = useState('NIFTY')
  const { ticks, latest, connected } = useOptionData(symbol)

  return (
    <div style={{ padding: 24, fontFamily: 'Inter, system-ui, sans-serif', color: '#e5e8ef' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, margin: 0 }}>Vega Sentiment Dashboard</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: connected ? '#22c55e' : '#ef4444',
              display: 'inline-block'
            }}
          />
          <span style={{ fontSize: 13, color: '#8892a6' }}>
            {connected ? 'Live' : 'Connecting...'}
          </span>
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            style={{
              background: '#151a24',
              color: '#e5e8ef',
              border: '1px solid #2a3140',
              borderRadius: 8,
              padding: '6px 10px'
            }}
          >
            <option value="NIFTY">NIFTY</option>
            <option value="BANKNIFTY">BANKNIFTY</option>
          </select>
        </div>
      </div>

      <StatCards latest={latest} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
        <div style={{ background: '#0f131b', border: '1px solid #1f2530', borderRadius: 12, padding: 16 }}>
          <h3 style={{ margin: '0 0 10px', fontSize: 14, color: '#8892a6' }}>CE / PE Vega & Difference</h3>
          <VegaChart ticks={ticks} />
        </div>
        <div style={{ background: '#0f131b', border: '1px solid #1f2530', borderRadius: 12, padding: 16 }}>
          <h3 style={{ margin: '0 0 10px', fontSize: 14, color: '#8892a6' }}>Spot vs VWAP + Buy/Sell Signals</h3>
          <VwapChart ticks={ticks} />
        </div>
      </div>
    </div>
  )
}
