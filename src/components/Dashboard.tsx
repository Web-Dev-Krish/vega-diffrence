import { useState } from 'react'
import { useOptionData } from '../hooks/useOptionData'
import { useActiveBrokerSettings } from '../hooks/useActiveBrokerSettings'
import { useHistoricalCandles } from '../hooks/useHistoricalCandles'
import { usePollMarketData } from '../hooks/usePollMarketData'
import type { Timeframe } from '../lib/candleAggregation'
import StatCards from './StatCards'
import VegaChart from './VegaChart'
import VwapChart from './VwapChart'
import SentimentChart from './SentimentChart'
import AlertsLog from './AlertsLog'
import Settings from './Settings'
import CandleChart from './CandleChart'
import TimeframeSelector from './TimeframeSelector'

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
  const [errorMinimized, setErrorMinimized] = useState(false)
  const [timeframe, setTimeframe] = useState<Timeframe>('5min')
  const brokerSettings = useActiveBrokerSettings()
  const { ticks, latest, connected } = useOptionData(symbol, brokerSettings?.max_points ?? 0)
  const SANE_VEGA_LIMIT = 1000
  const cleanLatest =
    [...ticks].reverse().find((t) => Math.abs(t.ce_vega) <= SANE_VEGA_LIMIT && Math.abs(t.pe_vega) <= SANE_VEGA_LIMIT) ??
    null
  const { candles, loading: candlesLoading, error: candlesError } = useHistoricalCandles(symbol, timeframe)
  const { lastResult: pollResult, lastError: pollError } = usePollMarketData(symbol, brokerSettings)

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
              {brokerSettings.broker === 'DHAN' ? 'Dhan' : brokerSettings.broker === 'ANGELONE' ? 'Angel One' : 'Upstox'} active
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

      <StatCards latest={cleanLatest} />

      {pollError && !errorMinimized && (
        <div
          style={{
            background: '#2a1418',
            border: '1px solid #5c1f28',
            color: '#f87171',
            borderRadius: 10,
            padding: '10px 14px',
            fontSize: 13,
            marginBottom: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 10
          }}
        >
          <div>
            <strong>Live data fetch fail ho raha hai:</strong> {pollError}
            <div style={{ color: '#c98a8a', fontSize: 12, marginTop: 4 }}>
              Settings mein broker active hai ya nahi, aur uske keys sahi hain ya nahi check karo. Edge function
              deploy hui hai ya nahi bhi confirm karo (<code>supabase functions deploy fetch-market-data</code>).
            </div>
          </div>
          <button
            onClick={() => setErrorMinimized(true)}
            title="Minimize"
            style={{
              background: 'transparent',
              border: '1px solid #5c1f28',
              color: '#f87171',
              borderRadius: 6,
              width: 24,
              height: 24,
              flexShrink: 0,
              cursor: 'pointer',
              fontSize: 14,
              lineHeight: 1
            }}
          >
            ✕
          </button>
        </div>
      )}
      {pollError && errorMinimized && (
        <div
          onClick={() => setErrorMinimized(false)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: '#2a1418',
            border: '1px solid #5c1f28',
            color: '#f87171',
            borderRadius: 20,
            padding: '4px 12px',
            fontSize: 12,
            marginBottom: 16,
            cursor: 'pointer'
          }}
        >
          ⚠ Live data error — dobara dekhne ke liye click karo
        </div>
      )}
      {!pollError && brokerSettings?.developer_mode && pollResult && (
        <div style={{ fontSize: 11, color: '#5a6274', marginBottom: 12 }}>
          Last poll ✓ {pollResult.symbol} spot={pollResult.spot} sentiment={pollResult.sentiment} via{' '}
          {pollResult.broker}
        </div>
      )}


      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
        <div style={panelStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 10 }}>
            <h3 style={{ margin: 0, fontSize: 14, color: '#8892a6' }}>
              {symbol} Price — {timeframe} (Upstox)
            </h3>
            <TimeframeSelector value={timeframe} onChange={setTimeframe} />
          </div>
          {candlesLoading && <div style={{ color: '#8892a6', fontSize: 13 }}>Candles load ho rahe hain...</div>}
          {candlesError && (
            <div style={{ color: '#ef4444', fontSize: 12, marginBottom: 8 }}>
              Historical data error: {candlesError}
            </div>
          )}
          {!candlesLoading && !candlesError && <CandleChart candles={candles} />}
        </div>

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
