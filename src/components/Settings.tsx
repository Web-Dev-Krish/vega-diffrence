import { useEffect, useState } from 'react'
import type { BrokerSettings, BrokerName } from '../types'
import { fetchAllBrokerSettings, saveBrokerSettings, setActiveBroker } from '../lib/settingsStore'

const inputStyle: React.CSSProperties = {
  background: '#0f131b',
  color: '#e5e8ef',
  border: '1px solid #2a3140',
  borderRadius: 8,
  padding: '8px 10px',
  fontSize: 13,
  width: '100%'
}

const labelStyle: React.CSSProperties = { fontSize: 12, color: '#8892a6', marginBottom: 4, display: 'block' }

function Field({
  label,
  value,
  onChange,
  type = 'text'
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={labelStyle}>{label}</label>
      <input style={inputStyle} type={type} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

export default function Settings({ onClose }: { onClose: () => void }) {
  const [rows, setRows] = useState<BrokerSettings[]>([])
  const [tab, setTab] = useState<BrokerName>('DHAN')
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')

  useEffect(() => {
    fetchAllBrokerSettings().then((data) => {
      setRows(data)
      const active = data.find((r) => r.is_active)
      if (active) setTab(active.broker)
    })
  }, [])

  const current = rows.find((r) => r.broker === tab)

  function updateField(field: keyof BrokerSettings, value: string | boolean | number) {
    setRows((prev) => prev.map((r) => (r.broker === tab ? { ...r, [field]: value } : r)))
  }

  async function handleSave() {
    if (!current) return
    setSaving(true)
    setSavedMsg('')
    try {
      await saveBrokerSettings(tab, current)
      setSavedMsg('Saved ✓')
    } catch (e) {
      setSavedMsg('Save failed: ' + String(e))
    } finally {
      setSaving(false)
      setTimeout(() => setSavedMsg(''), 2500)
    }
  }

  async function handleMakeActive() {
    setSaving(true)
    try {
      await setActiveBroker(tab)
      const data = await fetchAllBrokerSettings()
      setRows(data)
      setSavedMsg(`${tab} ab active hai ✓`)
    } catch (e) {
      setSavedMsg('Failed: ' + String(e))
    } finally {
      setSaving(false)
      setTimeout(() => setSavedMsg(''), 2500)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#0f131b',
          border: '1px solid #1f2530',
          borderRadius: 14,
          padding: 24,
          width: 460,
          maxHeight: '85vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 18, color: '#e5e8ef' }}>Broker API Settings</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#8892a6', fontSize: 18, cursor: 'pointer' }}>
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          {(['DHAN', 'ANGELONE'] as BrokerName[]).map((b) => {
            const row = rows.find((r) => r.broker === b)
            return (
              <button
                key={b}
                onClick={() => setTab(b)}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: tab === b ? '1px solid #38bdf8' : '1px solid #2a3140',
                  background: tab === b ? '#152233' : '#151a24',
                  color: '#e5e8ef',
                  cursor: 'pointer',
                  fontSize: 13,
                  position: 'relative'
                }}
              >
                {b === 'DHAN' ? 'Dhan' : 'Angel One'}
                {row?.is_active && (
                  <span
                    style={{
                      marginLeft: 6,
                      fontSize: 10,
                      color: '#22c55e',
                      fontWeight: 600
                    }}
                  >
                    ● ACTIVE
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {current && (
          <>
            {tab === 'DHAN' && (
              <>
                <Field
                  label="Dhan Client ID"
                  value={current.dhan_client_id ?? ''}
                  onChange={(v) => updateField('dhan_client_id', v)}
                />
                <Field
                  label="Dhan Access Token"
                  value={current.dhan_access_token ?? ''}
                  onChange={(v) => updateField('dhan_access_token', v)}
                  type="password"
                />
              </>
            )}

            {tab === 'ANGELONE' && (
              <>
                <Field
                  label="Angel One API Key"
                  value={current.angel_api_key ?? ''}
                  onChange={(v) => updateField('angel_api_key', v)}
                />
                <Field
                  label="Client Code"
                  value={current.angel_client_code ?? ''}
                  onChange={(v) => updateField('angel_client_code', v)}
                />
                <Field
                  label="Password / PIN"
                  value={current.angel_password ?? ''}
                  onChange={(v) => updateField('angel_password', v)}
                  type="password"
                />
                <Field
                  label="TOTP Secret"
                  value={current.angel_totp_secret ?? ''}
                  onChange={(v) => updateField('angel_totp_secret', v)}
                  type="password"
                />
                <Field
                  label="Access Token (auto-filled after login, optional to paste manually)"
                  value={current.angel_access_token ?? ''}
                  onChange={(v) => updateField('angel_access_token', v)}
                  type="password"
                />
              </>
            )}

            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Poll Interval (seconds)</label>
              <input
                style={inputStyle}
                type="number"
                min={1}
                value={current.poll_interval_seconds}
                onChange={(e) => updateField('poll_interval_seconds', Number(e.target.value))}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Max Points Kept in Chart (0 = unlimited / no limitation)</label>
              <input
                style={inputStyle}
                type="number"
                min={0}
                value={current.max_points}
                onChange={(e) => updateField('max_points', Number(e.target.value))}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <input
                type="checkbox"
                id="devmode"
                checked={current.developer_mode}
                onChange={(e) => updateField('developer_mode', e.target.checked)}
              />
              <label htmlFor="devmode" style={{ fontSize: 13, color: '#e5e8ef' }}>
                Developer Mode (raw tick/debug panel dikhaye)
              </label>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#38bdf8',
                  color: '#0b0f16',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleMakeActive}
                disabled={saving || current.is_active}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 8,
                  border: '1px solid #2a3140',
                  background: current.is_active ? '#151a24' : 'transparent',
                  color: current.is_active ? '#8892a6' : '#e5e8ef',
                  cursor: current.is_active ? 'default' : 'pointer'
                }}
              >
                {current.is_active ? 'Already Active' : `Use ${tab === 'DHAN' ? 'Dhan' : 'Angel One'}`}
              </button>
            </div>
            {savedMsg && <div style={{ marginTop: 10, fontSize: 12, color: '#8892a6' }}>{savedMsg}</div>}
          </>
        )}

        <p style={{ marginTop: 18, fontSize: 11, color: '#5a6274', lineHeight: 1.5 }}>
          Yeh keys <code>broker_settings</code> table mein save hoti hain aur Supabase Edge Function
          (<code>fetch-market-data</code>) poll karte waqt yahi se padhta hai — kisi bhi redeploy ki zaroorat nahi
          jab bhi aap broker switch ya key update karte ho.
        </p>
      </div>
    </div>
  )
}
