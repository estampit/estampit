"use client"
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{type: 'error' | 'success', text: string} | null>(null)
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage({ type: 'error', text: error.message })
      setLoading(false)
      return
    }

    if (data.user) {
      setMessage({ type: 'success', text: 'Login exitoso' })
      router.push('/dashboard/owner')
      router.refresh()
    }
    setLoading(false)
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (error) {
      setMessage({ type: 'error', text: error.message })
      setLoading(false)
      return
    }

    if (data.user) {
      setMessage({type: 'success', text: 'Cuenta creada. Inicia sesión.'})
      setTimeout(() => setMode('login'), 2000)
    }
    setLoading(false)
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/callback`,
    })

    if (error) {
      setMessage({ type: 'error', text: error.message })
      setLoading(false)
      return
    }

    setMessage({type: 'success', text: 'Revisa tu email'})
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {mode === 'login' && 'Iniciar sesión'}
            {mode === 'signup' && 'Crear cuenta'}
            {mode === 'reset' && 'Restablecer contraseña'}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={
          mode === 'login' ? handleLogin : mode === 'signup' ? handleSignup : handleReset
        }>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input id="email" name="email" type="email" autoComplete="email" required
                className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900"
                placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            {mode !== 'reset' && (
              <div>
                <input id="password" name="password" type="password" autoComplete="current-password" required
                  className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900"
                  placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            )}
          </div>
          {message && (
            <div className={`rounded-md p-4 ${message.type === 'error' ? 'bg-red-50' : 'bg-green-50'}`}>
              <p className={`text-sm ${message.type === 'error' ? 'text-red-800' : 'text-green-800'}`}>
                {message.text}
              </p>
            </div>
          )}
          <div>
            <button type="submit" disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
              {loading ? 'Cargando...' : mode === 'login' ? 'Iniciar sesión' : mode === 'signup' ? 'Crear cuenta' : 'Enviar enlace'}
            </button>
          </div>
          <div className="flex items-center justify-between text-sm">
            {mode === 'login' && (
              <>
                <button type="button" onClick={() => setMode('signup')} className="text-indigo-600 hover:text-indigo-500">
                  Crear cuenta
                </button>
                <button type="button" onClick={() => setMode('reset')} className="text-indigo-600 hover:text-indigo-500">
                  ¿Olvidaste tu contraseña?
                </button>
              </>
            )}
            {(mode === 'signup' || mode === 'reset') && (
              <button type="button" onClick={() => setMode('login')} className="text-indigo-600 hover:text-indigo-500">
                Volver a iniciar sesión
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
