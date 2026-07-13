import { useState } from 'react'
import { useOptionData } from '../hooks/useOptionData'
import { useActiveBrokerSettings } from '../hooks/useActiveBrokerSettings'
import StatCards from './StatCards'
import VegaChart from './VegaChart'
import VwapChart from './VwapChart'
import SentimentChart from './SentimentChart'
import AlertsLog from './AlertsLog'
import Settings from './Settings'

const panelStyle: React.CSSProperties = {
  background: '#0f131b',
  border: '1px solid #1f2530',
  borderRadius: 12,
  padding: 16
}

const panelTitleStyle: React.CSSProperties = { margin: '0 0 10px', fontSize: 14, color: '#8892a6' }

export default function Dashboard() {
  const [symbol, setSymbol] = useState('NIFTY')
  const [showSettings, setShowSettings] = useState(false)
  const brokerSettings = useActiveBrokerSettings()
  const { ticks, latest, connected } = useOptionData(symbol, brokerSettings?.max_points ?? 0)

  return (
    <div style={{ padding: 24, fontFamily: 'Inter, system-ui, sans-serif', color: '#e5e8ef' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
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
          <span style={{ fontSize: 13, color: '#8892a6' }}>{connected ? 'Live' : 'Connecting...'}</span>

          {brokerSettings && (
            <span
              style={{
                fontSize: 11,
                color: '#38bdf8',
                border: '1px solid #1f3a4d',
                background: '#0d1c26',
                borderRadius: 6,
                padding: '3px 8px'
              }}
            >
              {brokerSettings.broker === 'DHAN' ? 'Dhan' : 'Angel One'} active
            </span>
          )}

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

          <button
            onClick={() => setShowSettings(true)}
            style={{
              background: '#151a24',
              color: '#e5e8ef',
              border: '1px solid #2a3140',
              borderRadius: 8,
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: 13
            }}
          >
            ⚙ Settings
          </button>
        </div>
      </div>

      <StatCards latest={latest} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
        <div style={panelStyle}>
          <h3 style={panelTitleStyle}>CE / PE Vega & Difference</h3>
          <VegaChart ticks={ticks} />
        </div>

        <div style={panelStyle}>
          <h3 style={panelTitleStyle}>Spot vs VWAP + Buy/Sell Signals</h3>
          <VwapChart ticks={ticks} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 20 }}>
          <div style={panelStyle}>
            <h3 style={panelTitleStyle}>Sentiment Trend</h3>
            <SentimentChart ticks={ticks} />
          </div>

          <div style={panelStyle}>
            <h3 style={panelTitleStyle}>Buy/Sell Alerts</h3>
            <AlertsLog ticks={ticks} />
          </div>
        </div>

        {brokerSettings?.developer_mode && (
          <div style={panelStyle}>
            <h3 style={panelTitleStyle}>Developer Mode — Raw Latest Tick</h3>
            <pre
              style={{
                margin: 0,
                fontSize: 12,
                color: '#8892a6',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all'
              }}
            >
              {latest ? JSON.stringify(latest, null, 2) : 'No data yet'}
            </pre>
            <div style={{ marginTop: 10, fontSize: 12, color: '#5a6274' }}>
              Total points loaded: {ticks.length} (limit:{' '}
              {brokerSettings.max_points === 0 ? 'unlimited' : brokerSettings.max_points})
            </div>
          </div>
        )}
      </div>

      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  )
}
