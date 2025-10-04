const features = [
  {
    title: "🎯 Fidelización Inteligente",
    description: "Sistema de sellos digitales con gamificación avanzada y recompensas personalizadas."
  },
  {
    title: "📱 Apps Móviles Nativas",
    description: "Aplicaciones optimizadas para iOS y Android con integración a Apple/Google Wallet."
  },
  {
    title: "📊 Analytics en Tiempo Real",
    description: "Dashboard completo con métricas de clientes, ventas y comportamiento de usuarios."
  },
  {
    title: "🔗 Integraciones Poderosas",
    description: "Conecta con sistemas POS, CRM y herramientas de marketing existentes."
  },
  {
    title: "🎮 Gamificación Total",
    description: "Niveles, logros, desafíos y recompensas especiales para mantener a los clientes engaged."
  },
  {
    title: "🌍 Multi-idioma",
    description: "Soporte completo para múltiples idiomas y localizaciones."
  }
]

export function Features() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-4">
          Características que Marcan la Diferencia
        </h2>
        <p className="text-xl text-gray-600 text-center mb-16">
          MYSTAMP va más allá de las tarjetas de sellos tradicionales
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-lg card-hover">
              <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}