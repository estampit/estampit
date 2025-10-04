"use client"
import Link from 'next/link'
import { useAuth } from '@/app/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function AppTopBar() {
  const { user, loading } = useAuth()
  const supabase = createClient()
  const router = useRouter()

  const handleLogout = async () => {
    console.log('🚪 Cerrando sesión...')
    await supabase.auth.signOut()
    console.log('✅ Sesión cerrada')
    router.push('/login')
  }

  return (
    <div className="w-full bg-gray-900 text-gray-100 text-xs px-4 py-1 flex items-center gap-4">
      <Link href="/" className="font-semibold tracking-wide text-[11px]">MYSTAMP</Link>
      {user && (
        <>
          <Link href="/dashboard/owner" className="hover:underline">Dashboard</Link>
        </>
      )}
      {!user && !loading && <Link href="/login" className="hover:underline">Login</Link>}
      <div className="ml-auto flex items-center gap-3">
        {user ? (
          <>
            <span className="opacity-75 truncate max-w-[160px]" title={user.email}>{user.email}</span>
            <button
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 hover:underline"
            >
              Salir
            </button>
          </>
        ) : loading ? (
          <span className="opacity-75">Cargando...</span>
        ) : (
          <span className="opacity-75">Demo</span>
        )}
      </div>
    </div>
  )
}
