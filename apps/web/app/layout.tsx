import './globals.css'
import { Providers } from './providers'
import { AuthProvider } from './context/AuthContext'
import { AppTopBar } from './components/AppTopBar'
import { AuthDebugger } from './components/AuthDebugger'
import { Inter, Space_Grotesk } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' })

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
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased bg-neutral-50 text-neutral-900`}>
        <Providers>
          <AuthProvider>
            <AppTopBar />
            {children}
            <AuthDebugger />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  )
}