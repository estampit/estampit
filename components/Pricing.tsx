const Pricing = () => {
  const plans = [
    {
      name: "Gratis",
      price: "€0",
      period: "para siempre",
      description: "Perfecto para probar el sistema",
      features: [
        "1 programa de fidelidad",
        "Hasta 50 clientes",
        "Dashboard básico",
        "Soporte por email"
      ],
      cta: "Comenzar Gratis",
      popular: false
    },
    {
      name: "Pro", 
      price: "€19",
      period: "por mes",
      description: "Ideal para pequeños y medianos negocios",
      features: [
        "Programas ilimitados",
        "Clientes ilimitados", 
        "Analytics avanzados",
        "Notificaciones push",
        "Personalización completa",
        "Soporte prioritario"
      ],
      cta: "Empezar Prueba",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Personalizado",
      period: "para tu negocio", 
      description: "Para grandes empresas y cadenas",
      features: [
        "Todo lo de Pro",
        "Múltiples locales",
        "Integración POS",
        "API personalizada",
        "Soporte dedicado",
        "Implementación asistida"
      ],
      cta: "Contactar",
      popular: false
    }
  ]

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Precios Simples y Transparentes
          </h2>
          <p className="text-xl text-gray-600">
            Sin costes ocultos. Sin permanencia. Cancela cuando quieras.
          </p>
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-yellow-800">
              <span className="font-semibold">💡 Precio disruptivo:</span> 35% más barato que StampMe (€29/mes) y MagicStamp (€69/mes)
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`rounded-lg p-6 ${
                plan.popular 
                  ? 'border-2 border-blue-500 relative shadow-lg' 
                  : 'border border-gray-200 shadow-md'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Más Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold text-gray-900">{plan.price}</div>
                <div className="text-gray-500">{plan.period}</div>
                <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                  plan.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            ¿Necesitas más información? 
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <a href="#" className="text-blue-600 hover:text-blue-700">FAQ</a>
            <a href="#" className="text-blue-600 hover:text-blue-700">Comparar Planes</a>
            <a href="#" className="text-blue-600 hover:text-blue-700">Contactar Ventas</a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Pricing