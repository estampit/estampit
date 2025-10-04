'use client'

// Providers wrapper - currently just passes through children
// Can be used for future global providers (theme, i18n, etc.)
export function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}