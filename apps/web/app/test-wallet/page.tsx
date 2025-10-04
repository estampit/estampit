'use client'

import Link from 'next/link'

export default function TestWalletPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">🧪 Testing Wallet Passes</h1>

        <div className="space-y-6">
          {/* Paso 1: Registro de cliente */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">1. Registrar Cliente</h2>
            <p className="text-gray-600 mb-4">
              Registra un nuevo cliente con un businessId específico. El cliente se asociará automáticamente con el negocio.
            </p>
            <div className="space-y-2">
              <Link
                href="/register?businessId=test-business-123"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                📝 Registrar Cliente de Prueba
              </Link>
              <p className="text-sm text-gray-500">
                URL: <code className="bg-gray-100 px-1 rounded">/register?businessId=test-business-123</code>
              </p>
            </div>
          </div>

          {/* Paso 2: Dashboard del cliente */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">2. Dashboard del Cliente</h2>
            <p className="text-gray-600 mb-4">
              Una vez registrado, ve al dashboard del cliente para ver las tarjetas disponibles y generar wallet passes.
            </p>
            <div className="space-y-2">
              <Link
                href="/my"
                className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                📊 Ir al Dashboard
              </Link>
              <p className="text-sm text-gray-500">
                URL: <code className="bg-gray-100 px-1 rounded">/my</code>
              </p>
            </div>
          </div>

          {/* Paso 3: Generar Wallet Pass */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">3. Generar Wallet Pass</h2>
            <p className="text-gray-600 mb-4">
              En el dashboard, haz clic en "Wallet Pass" para generar un código QR y descargar el pass.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <h3 className="font-medium text-yellow-800 mb-2">Para Testing Local:</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• El botón "Descargar Pass" descarga un archivo JSON</li>
                <li>• Este JSON contiene la estructura del wallet pass</li>
                <li>• En producción, sería un archivo .pkpass firmado</li>
              </ul>
            </div>
          </div>

          {/* Paso 4: Simular Wallet */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">4. Simular Wallet App</h2>
            <p className="text-gray-600 mb-4">
              Opciones para probar el wallet pass en entorno local:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded p-4">
                <h3 className="font-medium mb-2">🍎 Simulador de Wallet (Mac)</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Si tienes Xcode instalado, puedes usar el simulador de Wallet.
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`xcrun simctl openurl booted "wallet-pass.json"`)
                    alert('Comando copiado al portapapeles. Ejecuta en Terminal.')
                  }}
                  className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                >
                  Copiar comando
                </button>
              </div>

              <div className="border rounded p-4">
                <h3 className="font-medium mb-2">🌐 Herramientas Online</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Usa herramientas online para crear passes de prueba.
                </p>
                <a
                  href="https://www.passsource.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                >
                  PassSource
                </a>
              </div>
            </div>
          </div>

          {/* Información técnica */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">ℹ️ Información Técnica</h2>
            <div className="space-y-3 text-sm">
              <div>
                <strong>Endpoint de descarga:</strong>
                <code className="bg-gray-100 px-1 rounded ml-2">/api/wallet/download?token=...</code>
              </div>
              <div>
                <strong>Estructura del pass:</strong> JSON compatible con Wallet
              </div>
              <div>
                <strong>Campos incluidos:</strong> Sellos, negocio, recompensa, QR code
              </div>
              <div>
                <strong>Para producción:</strong> Necesitas certificados de Apple y servidor de passes
              </div>
            </div>
          </div>

          {/* Flujo completo */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-blue-900">🚀 Flujo Completo de Testing</h2>
            <ol className="list-decimal list-inside space-y-2 text-blue-800">
              <li>Registra un cliente con businessId</li>
              <li>Ve al dashboard (/my)</li>
              <li>Une a una tarjeta de fidelización</li>
              <li>Genera un wallet pass</li>
              <li>Descarga el archivo JSON</li>
              <li>Úsalo con herramientas de testing de Wallet</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}