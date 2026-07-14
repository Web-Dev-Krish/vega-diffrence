import { useEffect, useRef, useState } from 'react'
import type { BrokerSettings } from '../types'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// All symbols the app knows about get polled in the background at all
// times — not just whichever one is currently selected in the dropdown.
// Previously only the selected symbol was polled, so switching away from
// e.g. NIFTY meant NIFTY's data (and any redeployed fix) silently stopped
// updating until someone switched back to it.
const ALL_SYMBOLS = ['NIFTY', 'BANKNIFTY']

// Calls the fetch-market-data edge function on a timer, straight from the
// browser, so data starts flowing the moment the dashboard is open — no
// dependency on an external cron service. (An external cron is still a good
// idea for after-hours/always-on ticking when no one has the tab open, but
// this makes the app work correctly on its own.)
export function usePollMarketData(activeSymbol: string, settings: BrokerSettings | null) {
  const [results, setResults] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const inFlight = useRef<Record<string, boolean>>({})

  useEffect(() => {
    if (!settings) return
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      setErrors({ [activeSymbol]: 'Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env' })
      return
    }

    const intervalMs = Math.max(settings.poll_interval_seconds, 3) * 1000

    async function pollOne(symbol: string) {
      if (inFlight.current[symbol]) return
      inFlight.current[symbol] = true
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/fetch-market-data?symbol=${symbol}`, {
          headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
        })
        const json = await res.json()
        if (json.error) {
          setErrors((prev) => ({ ...prev, [symbol]: json.error }))
        } else {
          setErrors((prev) => {
            const next = { ...prev }
            delete next[symbol]
            return next
          })
          setResults((prev) => ({ ...prev, [symbol]: json }))
        }
      } catch (e) {
        setErrors((prev) => ({ ...prev, [symbol]: String(e) }))
      } finally {
        inFlight.current[symbol] = false
      }
    }

    function pollAll() {
      ALL_SYMBOLS.forEach(pollOne)
    }

    pollAll()
    const id = setInterval(pollAll, intervalMs)
    return () => clearInterval(id)
  }, [settings?.broker, settings?.poll_interval_seconds, settings?.is_active])

  return { lastResult: results[activeSymbol] ?? null, lastError: errors[activeSymbol] ?? null }
}
