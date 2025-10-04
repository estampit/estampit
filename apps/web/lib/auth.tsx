'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { getSupabaseClient } from './supabaseClient'

// Business domain shape (simplified) – later can be replaced with generated types
export interface Business {
  id: string
  name: string
  email: string
  owner_id: string
  is_active: boolean
  created_at?: string
}

interface AuthContextType {
  user: any | null
  session: any | null
  business: Business | null
  isLoading: boolean
  signInWithEmail: (email: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  refreshBusiness: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = getSupabaseClient()
  const [session, setSession] = useState<any | null>(null)
  const [user, setUser] = useState<any | null>(null)
  const [business, setBusiness] = useState<Business | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadBusiness = useCallback(async (uid: string) => {
    // For now: fetch first business where owner_id = uid
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('owner_id', uid)
      .limit(1)
      .maybeSingle()
    if (error) {
      console.warn('Error loading business', error)
      return
    }
    setBusiness(data as Business | null)
  }, [supabase])

  useEffect(() => {
    let mounted = true
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!mounted) return
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user?.id) {
        await loadBusiness(session.user.id)
      }
      setIsLoading(false)
    }
    init()
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user ?? null)
      if (newSession?.user?.id) {
        loadBusiness(newSession.user.id)
      } else {
        setBusiness(null)
      }
    })
    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [supabase, loadBusiness])

  const signInWithEmail = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } })
    if (error) return { error: error.message }
    return {}
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const refreshBusiness = async () => {
    if (user?.id) await loadBusiness(user.id)
  }

  return (
    <AuthContext.Provider value={{ user, session, business, isLoading, signInWithEmail, signOut, refreshBusiness }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}