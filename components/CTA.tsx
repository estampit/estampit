export function CTA() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-5xl font-bold mb-6">
          ¿Listo para Revolucionar tu Negocio?
        </h2>
        <p className="text-xl text-gray-600 mb-10">
          Únete a miles de comerciantes que ya están transformando la experiencia 
          de sus clientes con MYSTAMP. Comienza tu prueba gratuita hoy mismo.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-10 py-4 rounded-lg font-bold text-lg hover:opacity-90 transition-opacity">
            Comenzar Prueba Gratuita
          </button>
          <button className="text-purple-600 border-2 border-purple-600 px-10 py-4 rounded-lg font-bold text-lg hover:bg-purple-600 hover:text-white transition-colors">
            Solicitar Demo
          </button>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          ✅ Prueba gratuita de 30 días • ✅ Sin tarjeta de crédito • ✅ Soporte 24/7
        </div>
      </div>
    </section>
  )
}