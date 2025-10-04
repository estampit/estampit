export function Hero() {
  return (
    <section className="mystamp-gradient min-h-screen flex items-center justify-center text-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h1 className="text-6xl font-bold mb-6">
          ¡Bienvenido a <span className="text-yellow-300">MYSTAMP</span>!
        </h1>
        <p className="text-xl mb-8 text-gray-200">
          La plataforma de fidelización digital que revoluciona la forma en que las empresas 
          conectan con sus clientes. Olvídate de las tarjetas físicas y descubre el futuro 
          de la lealtad digital.
        </p>
        <div className="flex gap-4 justify-center">
          <button className="bg-white text-purple-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors">
            Comenzar Gratis
          </button>
          <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-purple-600 transition-colors">
            Ver Demo
          </button>
        </div>
      </div>
    </section>
  )
}