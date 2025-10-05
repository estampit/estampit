import Link from 'next/link'
import clsx from 'clsx'
import { SecondaryButton } from './primitives'

const navigation = [
  { name: 'Plataforma', href: '#features' },
  { name: 'Casos de uso', href: '#use-cases' },
  { name: 'Precios', href: '#pricing' },
  { name: 'Recursos', href: '#faq' },
]

export function MarketingNavbar({ className }: { className?: string }) {
  return (
    <header className={clsx('sticky top-0 z-40 border-b border-white/10 bg-white/70 backdrop-blur', className)}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-neutral-900">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-500 text-white shadow-glow">
            ✦
          </span>
          <span>MYSTAMP</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-neutral-600 md:flex">
          {navigation.map((item) => (
            <a key={item.name} href={item.href} className="transition hover:text-neutral-900">
              {item.name}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <SecondaryButton href="/login" className="hidden md:inline-flex">
            Iniciar sesión
          </SecondaryButton>
          <Link
            href="/register"
            className="inline-flex items-center rounded-full bg-primary-500 px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5 hover:bg-primary-600"
          >
            Comenzar gratis
          </Link>
        </div>
      </div>
    </header>
  )
}
