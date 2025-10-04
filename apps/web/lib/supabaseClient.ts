// Supabase client (browser) factory
// This centralizes Supabase initialization so we don't create multiple instances.
// It expects NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to be set.

import { createBrowserClient } from '@supabase/ssr'

let browserClient: any = null

function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift()
}

function setCookie(name: string, value: string, options: any = {}) {
  let cookie = `${name}=${value}`
  if (options.maxAge) cookie += `; max-age=${options.maxAge}`
  if (options.path) cookie += `; path=${options.path}`
  if (options.domain) cookie += `; domain=${options.domain}`
  if (options.sameSite) cookie += `; samesite=${options.sameSite}`
  if (options.secure) cookie += '; secure'
  document.cookie = cookie
}

function deleteCookie(name: string, options: any = {}) {
  setCookie(name, '', { ...options, maxAge: 0 })
}

export function getSupabaseClient() {
  if (browserClient) return browserClient
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) {
    // We throw early to make misconfiguration obvious in dev
    throw new Error('Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  console.log('🔧 Creating Supabase browser client with cookie storage')
  browserClient = createBrowserClient(url, anon, {
    cookies: {
      get(name: string) {
        return getCookie(name)
      },
      set(name: string, value: string, options: any) {
        setCookie(name, value, options)
      },
      remove(name: string, options: any) {
        deleteCookie(name, options)
      },
    },
  })
  return browserClient
}