"use client"
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabaseClient'

export function AppTopBar() {
  const supabase = getSupabaseClient()
  const [user, setUser] = useState<any>(null)
  const [businessId, setBusinessId] = useState<string|undefined>(undefined)
  useEffect(()=> {
    let cancelled = false
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (cancelled) return
      setUser(user)
      if (user) {
        const { data: biz } = await supabase.from('businesses').select('id').eq('owner_id', user.id).order('created_at').limit(1)
        if (biz && biz.length) setBusinessId(biz[0].id)
      }
    }
    load()
    // optional realtime refresh if needed
    return ()=> { cancelled = true }
  }, [supabase])

  return (
    <div className="w-full bg-gray-900 text-gray-100 text-xs px-4 py-1 flex items-center gap-4">
      <Link href="/" className="font-semibold tracking-wide text-[11px]">MYSTAMP</Link>
      {user && businessId && (
        <>
          <Link href="/dashboard/owner" className="hover:underline">Dashboard</Link>
          <Link href={`/join/${businessId}`} className="hover:underline">Join Link</Link>
          <Link href={`/my/pass?business=${businessId}`} className="hover:underline">Mi Pass</Link>
        </>
      )}
      {!user && <Link href="/login" className="hover:underline">Login</Link>}
      <div className="ml-auto flex items-center gap-3">
        {user ? (
          <span className="opacity-75 truncate max-w-[160px]" title={user.email}>{user.email}</span>
        ) : (
          <span className="opacity-75">Demo</span>
        )}
      </div>
    </div>
  )
}
