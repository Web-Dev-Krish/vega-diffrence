import { useEffect, useState } from 'react'
import type { BrokerSettings } from '../types'
import { fetchAllBrokerSettings, subscribeToBrokerSettings } from '../lib/settingsStore'

export function useActiveBrokerSettings() {
  const [active, setActive] = useState<BrokerSettings | null>(null)

  useEffect(() => {
    let mounted = true

    async function load() {
      const rows = await fetchAllBrokerSettings()
      if (mounted) setActive(rows.find((r) => r.is_active) ?? null)
    }

    load()
    const unsubscribe = subscribeToBrokerSettings(load)

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  return active
}
