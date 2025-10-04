'use client'
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface EventRow { id: string; event_type: string; created_at: string; metadata: any }

export function EventsFeedClient({ initial, businessId }: { initial: EventRow[]; businessId: string }) {
  const [events, setEvents] = useState<EventRow[]>(initial)
  useEffect(() => {
    const supabase = createClientComponentClient()
    const channel = supabase
      .channel('realtime-events')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'events', filter: `business_id=eq.${businessId}` }, (payload: any) => {
        setEvents(prev => [payload.new as EventRow, ...prev].slice(0, 25))
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [businessId])
  return (
    <div className="border rounded p-4 space-y-2">
      <h4 className="font-semibold text-sm">Eventos recientes (Live)</h4>
      <ul className="text-[11px] space-y-1 max-h-64 overflow-auto">
        {events.map(ev => (
          <li key={ev.id} className="flex flex-col border-b pb-1 last:border-none">
            <span className="font-medium">{ev.event_type}</span>
            <span className="text-gray-500">{new Date(ev.created_at).toLocaleTimeString()} – {new Date(ev.created_at).toLocaleDateString()}</span>
            {ev.metadata && <code className="truncate">{JSON.stringify(ev.metadata)}</code>}
          </li>
        ))}
        {events.length === 0 && <li>No hay eventos.</li>}
      </ul>
    </div>
  )
}
