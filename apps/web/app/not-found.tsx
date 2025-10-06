import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 px-6 py-16">
      <div className="max-w-md text-center space-y-6">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-2xl font-semibold">
          404
        </div>
        <h1 className="text-3xl font-bold text-neutral-900">Página no encontrada</h1>
        <p className="text-neutral-600">
          No hemos podido encontrar lo que buscas. Comprueba la URL o vuelve al inicio para seguir explorando Mystamp.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto rounded-lg border border-neutral-200 px-5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
          >
            Ir a la página principal
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            Ir al panel de control
          </Link>
        </div>
      </div>
    </main>
  )
}
