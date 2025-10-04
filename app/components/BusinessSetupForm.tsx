'use client'
import { useState, FormEvent } from 'react'
import { createBusinessWithCard, uploadBusinessLogo } from '@/actions/business'
import { isDemoMode, demoCreateBusiness, demoUploadBusinessLogo } from '../lib/demoApi'

export function BusinessSetupForm() {
  const [name, setName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<string>('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('Creando...')
  const demo = isDemoMode()
  const res = demo ? await demoCreateBusiness(name) : await createBusinessWithCard({ name })
  if (!res.success && 'error' in res) { setStatus('Error: ' + res.error); return }
    const businessId = res.data?.business_id || res.data?.id || res.data?.business?.id
    if (file && businessId) {
      setStatus('Subiendo logo...')
  const up = demo ? await demoUploadBusinessLogo(businessId, file) : await uploadBusinessLogo(businessId, file)
  if (!up.success && 'error' in up) { setStatus('Logo error: ' + up.error); return }
    }
    setStatus('Listo')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border p-4 rounded">
      <h3 className="font-semibold">Crear negocio</h3>
      <input className="border px-2 py-1 w-full" placeholder="Nombre" value={name} onChange={e=>setName(e.target.value)} />
      <input type="file" onChange={e=>setFile(e.target.files?.[0]||null)} />
      <button className="bg-blue-600 text-white px-3 py-1 rounded" disabled={!name}>Crear</button>
      <div className="text-sm">{status}</div>
    </form>
  )
}
