import './globals.css'
import { Providers } from './providers'
import { AuthProvider } from '@/lib/auth'
import { AppTopBar } from './components/AppTopBar'

export const metadata = {
  title: 'MYSTAMP - Digital Loyalty Platform',
  description: 'La plataforma de fidelización digital más avanzada que supera a StampMe, MagicStamp y LoyiCard.',
  keywords: ['loyalty', 'fidelización', 'digital', 'stamps', 'recompensas', 'mystamp'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="antialiased">
        <Providers>
          <AuthProvider>
            <AppTopBar />
            {children}
          </AuthProvider>
        </Providers>
      </body>
    </html>
  )
}