import { getServerSupabase } from '@/lib/supabaseServer'

export async function EventsFeed({ businessId }: { businessId: string }) {
  const supabase = await getServerSupabase()
  const { data: events } = await supabase
    .from('events')
    .select('id,event_type,created_at,actor_id,customer_id,metadata')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(15)
  return (
    <div className="border rounded p-4 space-y-2">
      <h4 className="font-semibold text-sm">Eventos recientes</h4>
      <ul className="text-[11px] space-y-1 max-h-64 overflow-auto">
        {(events||[]).map((ev: any) => (
          <li key={ev.id} className="flex flex-col border-b pb-1 last:border-none">
            <span className="font-medium">{ev.event_type}</span>
            <span className="text-gray-500">{new Date(ev.created_at).toLocaleString()}</span>
            {ev.metadata && <code className="truncate">{JSON.stringify(ev.metadata)}</code>}
          </li>
        ))}
        {(!events || events.length === 0) && <li>No hay eventos aún.</li>}
      </ul>
    </div>
  )
}
