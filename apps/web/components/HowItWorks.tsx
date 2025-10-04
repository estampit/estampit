const HowItWorks = () => {
  const steps = [
    {
      step: "1",
      title: "Regístrate",
      description: "Crea tu cuenta y configura tu programa de fidelidad en 5 minutos",
      icon: "🚀"
    },
    {
      step: "2", 
      title: "Personaliza",
      description: "Define cuántos sellos necesitan tus clientes para obtener la recompensa",
      icon: "⚙️"
    },
    {
      step: "3",
      title: "Comparte QR",
      description: "Coloca el código QR en tu negocio o compártelo digitalmente",
      icon: "📱"
    },
    {
      step: "4",
      title: "Fideliza",
      description: "Tus clientes escanean y acumulan sellos automáticamente",
      icon: "❤️"
    }
  ]

  return (
    <section id="how-it-works" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            ¿Cómo funciona?
          </h2>
          <p className="text-xl text-gray-600">
            En solo 4 pasos tienes tu programa de fidelidad funcionando
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="bg-white rounded-lg p-6 shadow-md mb-4">
                <div className="text-4xl mb-4">{step.icon}</div>
                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="bg-blue-50 rounded-xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              ¿Necesitas ayuda para empezar?
            </h3>
            <p className="text-gray-600 mb-6">
              Nuestro equipo te ayuda a configurar todo gratuitamente
            </p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Hablar con un Experto
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks