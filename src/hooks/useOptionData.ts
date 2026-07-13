import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { OptionTick } from '../types'

const MAX_POINTS = 200

export function useOptionData(symbol: string) {
  const [ticks, setTicks] = useState<OptionTick[]>([])
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    let mounted = true

    async function loadHistory() {
      const { data, error } = await supabase
        .from('option_ticks')
        .select('*')
        .eq('symbol', symbol)
        .order('created_at', { ascending: true })
        .limit(MAX_POINTS)

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
            return next.length > MAX_POINTS ? next.slice(-MAX_POINTS) : next
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
  }, [symbol])

  const latest = ticks.length > 0 ? ticks[ticks.length - 1] : null

  return { ticks, latest, connected }
}
