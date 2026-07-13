import { supabase } from './supabaseClient'
import type { BrokerSettings, BrokerName } from '../types'

export async function fetchAllBrokerSettings(): Promise<BrokerSettings[]> {
  const { data, error } = await supabase.from('broker_settings').select('*').order('broker')
  if (error) throw error
  return (data ?? []) as BrokerSettings[]
}

export async function saveBrokerSettings(
  broker: BrokerName,
  fields: Partial<BrokerSettings>
): Promise<void> {
  const { error } = await supabase
    .from('broker_settings')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('broker', broker)
  if (error) throw error
}

// Only one broker can be active at a time — flips the other one off.
export async function setActiveBroker(broker: BrokerName): Promise<void> {
  const { error: offErr } = await supabase
    .from('broker_settings')
    .update({ is_active: false })
    .neq('broker', broker)
  if (offErr) throw offErr

  const { error: onErr } = await supabase
    .from('broker_settings')
    .update({ is_active: true })
    .eq('broker', broker)
  if (onErr) throw onErr
}

export function subscribeToBrokerSettings(onChange: () => void) {
  const channel = supabase
    .channel('broker_settings_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'broker_settings' },
      onChange
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
