export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      {/* Header */}
      <header className="relative z-10 text-white">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-4xl">🎯</div>
              <div className="text-2xl font-bold">MYSTAMP</div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="/demo" className="hover:text-yellow-300 transition-colors font-medium">🎮 Demo Live</a>
              <a href="/login" className="hover:text-yellow-300 transition-colors font-medium">📊 Dashboard</a>
              <a href="#features" className="hover:text-yellow-300 transition-colors font-medium">Características</a>
              <a href="#pricing" className="hover:text-yellow-300 transition-colors font-medium">Precios</a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex items-center justify-center text-white px-6" style={{minHeight: 'calc(100vh - 100px)'}}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="text-8xl mb-6">🎯</div>
            <h1 className="text-6xl font-bold mb-6">
              Bienvenido a <span className="text-yellow-300">MYSTAMP</span>
            </h1>
            <p className="text-xl mb-8 text-gray-200 max-w-2xl mx-auto">
              La plataforma de fidelización digital más avanzada. 
              Con IA, gamificación y wallet integration que supera a StampMe, 
              MagicStamp y toda la competencia.
            </p>
          </div>

          {/* Competitive Advantages */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl mb-3">🤖</div>
              <h3 className="text-xl font-bold mb-2">IA Nativa</h3>
              <p className="text-sm text-gray-200">Único con inteligencia artificial integrada vs competencia básica</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl mb-3">💳</div>
              <h3 className="text-xl font-bold mb-2">Wallet Universal</h3>
              <p className="text-sm text-gray-200">Apple + Google + Samsung Wallet vs ninguna integración</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl mb-3">🎮</div>
              <h3 className="text-xl font-bold mb-2">Gamificación Total</h3>
              <p className="text-sm text-gray-200">Niveles + logros + desafíos vs funciones básicas</p>
            </div>
          </div>

          {/* Pricing Disruption */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 mb-8">
            <h2 className="text-3xl font-bold mb-6">Pricing Revolucionario</h2>
            <div className="grid md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-yellow-300">€19/mes</div>
                <div className="text-sm">MYSTAMP</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-300">€29+/mes</div>
                <div className="text-sm">StampMe</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-300">€69+/mes</div>
                <div className="text-sm">MagicStamp</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-300">€30+/mes</div>
                <div className="text-sm">LoyiCard</div>
              </div>
            </div>
          </div>

          {/* CTAs */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="/login"
            className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition-colors text-center"
          >
            Comenzar Gratis
          </a>
          <a 
            href="/demo"
            className="bg-purple-800 hover:bg-purple-900 text-white px-8 py-4 rounded-xl font-bold transition-colors text-center"
          >
            Ver Demo Interactivo
          </a>
        </div>

          {/* Competitive Stats */}
          <div className="mt-12 text-center">
            <h3 className="text-2xl font-bold mb-4">Superamos a Toda la Competencia</h3>
            <div className="flex justify-center gap-8 text-sm">
              <div>✅ 40% más barato que StampMe</div>
              <div>✅ Sin hardware vs MagicStamp</div>
              <div>✅ 10x más funciones que LoyiCard</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-20 bg-white text-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16">
            Comparativa vs Competidores Principales
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left">Característica</th>
                  <th className="px-6 py-4 text-center font-bold text-purple-600">MYSTAMP</th>
                  <th className="px-6 py-4 text-center">StampMe</th>
                  <th className="px-6 py-4 text-center">MagicStamp</th>
                  <th className="px-6 py-4 text-center">LoyiCard</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="px-6 py-4 font-semibold">Inteligencia Artificial</td>
                  <td className="px-6 py-4 text-center">✅ Nativa</td>
                  <td className="px-6 py-4 text-center text-red-500">❌</td>
                  <td className="px-6 py-4 text-center text-red-500">❌</td>
                  <td className="px-6 py-4 text-center text-red-500">❌</td>
                </tr>
                <tr className="border-t bg-gray-50">
                  <td className="px-6 py-4 font-semibold">Wallet Integration</td>
                  <td className="px-6 py-4 text-center">✅ Universal</td>
                  <td className="px-6 py-4 text-center text-red-500">❌</td>
                  <td className="px-6 py-4 text-center text-red-500">❌</td>
                  <td className="px-6 py-4 text-center text-yellow-500">⚠️ Básico</td>
                </tr>
                <tr className="border-t">
                  <td className="px-6 py-4 font-semibold">Gamificación</td>
                  <td className="px-6 py-4 text-center">✅ Completa</td>
                  <td className="px-6 py-4 text-center text-yellow-500">⚠️ Básica</td>
                  <td className="px-6 py-4 text-center text-red-500">❌</td>
                  <td className="px-6 py-4 text-center text-red-500">❌</td>
                </tr>
                <tr className="border-t bg-gray-50">
                  <td className="px-6 py-4 font-semibold">Precio Mensual</td>
                  <td className="px-6 py-4 text-center font-bold text-green-600">€19/mes</td>
                  <td className="px-6 py-4 text-center text-red-600">€29+/mes</td>
                  <td className="px-6 py-4 text-center text-red-600">€69+/mes</td>
                  <td className="px-6 py-4 text-center text-red-600">€30+/mes</td>
                </tr>
                <tr className="border-t">
                  <td className="px-6 py-4 font-semibold">Setup Time</td>
                  <td className="px-6 py-4 text-center">✅ 5 minutos</td>
                  <td className="px-6 py-4 text-center text-yellow-500">⚠️ 30 min</td>
                  <td className="px-6 py-4 text-center text-red-500">❌ Horas</td>
                  <td className="px-6 py-4 text-center text-yellow-500">⚠️ 20 min</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section id="features" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
            Sistema Completo y Funcional
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Demo Interactivo */}
            <div className="bg-gradient-to-br from-purple-500 to-blue-600 text-white rounded-xl p-8 text-center hover:scale-105 transition-transform">
              <div className="text-5xl mb-4">🎮</div>
              <h3 className="text-2xl font-bold mb-4">Demo Interactivo</h3>
              <p className="mb-6 opacity-90">
                Experimenta la app del cliente en tiempo real. Escanea QR, gana sellos y obtén recompensas.
              </p>
              <a 
                href="/demo"
                className="bg-white text-purple-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors inline-block"
              >
                Probar Demo →
              </a>
            </div>

            {/* Dashboard Completo */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl p-8 text-center hover:scale-105 transition-transform">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-2xl font-bold mb-4">Panel de Control</h3>
              <p className="mb-6 opacity-90">
                Dashboard completo con gestión de clientes, analytics en tiempo real y programa de fidelización.
              </p>
              <a 
                href="/login"
                className="bg-white text-green-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors inline-block"
              >
                Ver Dashboard →
              </a>
            </div>

            {/* Sistema Completo */}
            <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-xl p-8 text-center hover:scale-105 transition-transform">
              <div className="text-5xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold mb-4">100% Funcional</h3>
              <p className="mb-6 opacity-90">
                Sistema completo con base de datos, autenticación, gestión de clientes y simulación móvil.
              </p>
              <div className="bg-white text-orange-600 px-6 py-3 rounded-lg font-bold inline-block">
                ✅ Disponible
              </div>
            </div>

          </div>

          {/* Features Grid */}
          <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="text-3xl mb-3">🔐</div>
              <h4 className="font-bold text-gray-800 mb-2">Autenticación</h4>
              <p className="text-sm text-gray-600">Sistema de login seguro con demo funcional</p>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="text-3xl mb-3">👥</div>
              <h4 className="font-bold text-gray-800 mb-2">Gestión Clientes</h4>
              <p className="text-sm text-gray-600">CRUD completo de clientes con datos realistas</p>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="text-3xl mb-3">⭐</div>
              <h4 className="font-bold text-gray-800 mb-2">Sistema Sellos</h4>
              <p className="text-sm text-gray-600">Progreso visual y recompensas automáticas</p>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="text-3xl mb-3">📱</div>
              <h4 className="font-bold text-gray-800 mb-2">Vista Móvil</h4>
              <p className="text-sm text-gray-600">Simulación completa de experiencia cliente</p>
            </div>

          </div>

          {/* Credenciales Demo */}
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-8">
            <h3 className="text-xl font-bold text-blue-800 mb-4 text-center">
              🔑 Credenciales de Demo
            </h3>
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg border">
                  <div className="font-bold text-gray-800 mb-2">Email:</div>
                  <div className="font-mono text-blue-600">demo@mystamp.app</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg border">
                  <div className="font-bold text-gray-800 mb-2">Password:</div>
                  <div className="font-mono text-blue-600">demo123</div>
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-blue-700 mt-4">
              Usa estas credenciales para acceder al dashboard completo con datos de prueba
            </p>
          </div>

        </div>
      </section>
    </main>
  )
}