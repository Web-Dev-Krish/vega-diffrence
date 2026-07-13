import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { OptionTick } from '../types'

// 0 (or not set) = no limitation, keep every tick that arrives.
// A hard safety ceiling still applies so the browser tab doesn't run out of
// memory on a multi-day session — bump SAFETY_CEILING if you need more.
const SAFETY_CEILING = 50000

export function useOptionData(symbol: string, maxPoints = 0) {
  const [ticks, setTicks] = useState<OptionTick[]>([])
  const [connected, setConnected] = useState(false)

  const cap = maxPoints > 0 ? maxPoints : SAFETY_CEILING

  useEffect(() => {
    let mounted = true

    async function loadHistory() {
      const { data, error } = await supabase
        .from('option_ticks')
        .select('*')
        .eq('symbol', symbol)
        .order('created_at', { ascending: true })
        .limit(cap)

      if (!error && data && mounted) {
        setTicks(data as OptionTick[])
      }
    }

    loadHistory()

    const channel = supabase
      .channel(`option_ticks_${symbol}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'option_ticks',
          filter: `symbol=eq.${symbol}`
        },
        (payload) => {
          setTicks((prev) => {
            const next = [...prev, payload.new as OptionTick]
            return next.length > cap ? next.slice(-cap) : next
          })
        }
      )
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED')
      })

    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [symbol, cap])

  const latest = ticks.length > 0 ? ticks[ticks.length - 1] : null

  return { ticks, latest, connected }
}
