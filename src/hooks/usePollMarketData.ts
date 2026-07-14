import { useEffect, useRef, useState } from 'react'
import type { BrokerSettings } from '../types'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Calls the fetch-market-data edge function on a timer, straight from the
// browser, so data starts flowing the moment the dashboard is open — no
// dependency on an external cron service. (An external cron is still a good
// idea for after-hours/always-on ticking when no one has the tab open, but
// this makes the app work correctly on its own.)
export function usePollMarketData(symbol: string, settings: BrokerSettings | null) {
  const [lastResult, setLastResult] = useState<any>(null)
  const [lastError, setLastError] = useState<string | null>(null)
  const inFlight = useRef(false)

  useEffect(() => {
    if (!settings) return
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      setLastError('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env')
      return
    }

    const intervalMs = Math.max(settings.poll_interval_seconds, 3) * 1000

    async function poll() {
      if (inFlight.current) return
      inFlight.current = true
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/fetch-market-data?symbol=${symbol}`, {
          headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
        })
        const json = await res.json()
        if (json.error) {
          setLastError(json.error)
        } else {
          setLastError(null)
          setLastResult(json)
        }
      } catch (e) {
        setLastError(String(e))
      } finally {
        inFlight.current = false
      }
    }

    poll()
    const id = setInterval(poll, intervalMs)
    return () => clearInterval(id)
  }, [symbol, settings?.broker, settings?.poll_interval_seconds, settings?.is_active])

  return { lastResult, lastError }
}
