"use client"
import useSWR from 'swr'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { listStaff, updateStaffRole, setStaffActive } from '@/actions/staff'
import { createClient } from '@/lib/supabase/client'

const fetcher = async (businessId: string) => {
  const res = await listStaff(businessId)
  if (!res.success) throw new Error(res.error || 'error')
  return res.data
}

export function StaffManagement({ businessId }: { businessId: string }) {
  const { data, error, mutate, isLoading } = useSWR(['staff', businessId], ([, id]) => fetcher(id), { refreshInterval: 60000 })
  const [roleDraft, setRoleDraft] = useState<Record<string,string>>({})
  if (error) return <div className="text-sm text-red-600">Error cargando staff</div>
  return (
    <div className="border rounded p-3 space-y-3">
      <div className="flex items-center gap-2">
        <h4 className="font-semibold text-sm">Staff</h4>
        <button onClick={()=> mutate()} className="text-xs underline">Refrescar</button>
      </div>
      {isLoading && <div className="text-xs text-gray-500">Cargando...</div>}
      <div className="space-y-2">
        {(data||[]).length === 0 && !isLoading && <div className="text-xs text-gray-500">Sin miembros todavía.</div>}
        {(data||[]).map((s:any)=> {
          const editing = roleDraft[s.id] !== undefined
          return (
            <div key={s.id} className="flex items-center gap-2 text-xs bg-gray-50 rounded px-2 py-1">
              <span className="font-medium truncate max-w-[120px]" title={s.user_id}>{s.user_id.slice(0,8)}…</span>
              {editing ? (
                <select value={roleDraft[s.id]} onChange={e=> setRoleDraft(r=> ({ ...r, [s.id]: e.target.value }))} className="border rounded px-1 py-0.5">
                  <option value="staff">staff</option>
                  <option value="manager">manager</option>
                  <option value="owner">owner</option>
                </select>
              ) : (
                <span className="px-1.5 py-0.5 rounded bg-white border">{s.role}</span>
              )}
              <span className={`px-1.5 py-0.5 rounded ${s.is_active? 'bg-green-100 text-green-700':'bg-gray-200'}`}>{s.is_active? 'Activo':'Inactivo'}</span>
              <div className="ml-auto flex gap-1">
                {editing ? (
                  <>
                    <button className="border rounded px-1" onClick={async ()=> { const newRole = roleDraft[s.id]; const res = await updateStaffRole(s.id, newRole); if(!res.success) toast.error(res.error||'Error'); else { toast.success('Actualizado'); mutate(); } setRoleDraft(r=> { const copy={...r}; delete copy[s.id]; return copy }) }}>Guardar</button>
                    <button className="border rounded px-1" onClick={()=> setRoleDraft(r=> { const copy={...r}; delete copy[s.id]; return copy })}>Cancelar</button>
                  </>
                ) : (
                  <button className="border rounded px-1" onClick={()=> setRoleDraft(r=> ({ ...r, [s.id]: s.role }))}>Editar</button>
                )}
                <button className="border rounded px-1" onClick={async ()=> { const res = await setStaffActive(s.id, !s.is_active); if(!res.success) toast.error(res.error||'Error'); else { toast.success('Estado actualizado'); mutate(); } }}>{s.is_active? 'Desactivar':'Activar'}</button>
              </div>
            </div>
          )
        })}
      </div>
      <div className="pt-2 border-t">
        <p className="text-[11px] text-gray-500">Invitaciones por email aún no implementadas (requiere clave de servicio).</p>
      </div>
    </div>
  )
}
