const Stats = () => {
  const stats = [
    {
      number: "35%",
      label: "Más Barato",
      description: "que la competencia"
    },
    {
      number: "5min",
      label: "Setup Rápido", 
      description: "vs 30+ min otros"
    },
    {
      number: "0€",
      label: "Plan Gratis",
      description: "para siempre"
    },
    {
      number: "24/7",
      label: "Funcionamiento",
      description: "sin interrupciones"
    }
  ]

  return (
    <section className="py-16 bg-blue-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Por qué MYSTAMP supera a la competencia?
          </h2>
          <p className="text-blue-100 text-lg">
            Comparamos directamente con StampMe, MagicStamp y otros líderes del mercado
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-sm">
              <div className="text-4xl font-bold mb-2">{stat.number}</div>
              <div className="text-xl font-semibold text-blue-100 mb-1">{stat.label}</div>
              <div className="text-blue-200 text-sm">{stat.description}</div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-white bg-opacity-10 rounded-xl p-6 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">Pricing Disruptivo</h3>
            <div className="grid md:grid-cols-4 gap-4 text-center">
              <div className="bg-green-500 bg-opacity-20 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-200">€19/mes</div>
                <div className="text-sm text-white">MYSTAMP Pro</div>
              </div>
              <div className="bg-red-500 bg-opacity-20 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-200">€29/mes</div>
                <div className="text-sm text-white">StampMe</div>
              </div>
              <div className="bg-red-500 bg-opacity-20 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-200">€69/mes</div>
                <div className="text-sm text-white">MagicStamp</div>
              </div>
              <div className="bg-red-500 bg-opacity-20 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-200">€45/mes</div>
                <div className="text-sm text-white">Otros</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Stats