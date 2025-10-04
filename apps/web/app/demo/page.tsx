'use client'

import { useState } from 'react'

export default function DemoPage() {
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null)
  const [customerStamps, setCustomerStamps] = useState(7)
  const [showReward, setShowReward] = useState(false)

  const businesses = [
    {
      id: '1',
      name: 'Café Central',
      category: 'Cafetería',
      stampsRequired: 10,
      reward: 'Café Gratis',
      emoji: '☕'
    },
    {
      id: '2', 
      name: 'Pizza Roma',
      category: 'Restaurante',
      stampsRequired: 8,
      reward: 'Pizza Gratis',
      emoji: '🍕'
    },
    {
      id: '3',
      name: 'Salón Bella',
      category: 'Belleza',
      stampsRequired: 6,
      reward: '50% Descuento',
      emoji: '💄'
    }
  ]

  const handleBusinessSelect = (business: any) => {
    setSelectedBusiness(business)
    setCustomerStamps(7) // Reset to demo value
    setShowReward(false)
  }

  const handleAddStamp = () => {
    if (!selectedBusiness) return
    
    const newStamps = customerStamps + 1
    
    if (newStamps >= selectedBusiness.stampsRequired) {
      setCustomerStamps(0)
      setShowReward(true)
    } else {
      setCustomerStamps(newStamps)
    }
  }

  const resetDemo = () => {
    setSelectedBusiness(null)
    setShowReward(false)
    setCustomerStamps(7)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900">
      {/* Header */}
      <div className="bg-white bg-opacity-10 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-white">MYSTAMP</h1>
              <p className="ml-4 text-blue-200">Demo Interactivo</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={resetDemo}
                className="text-white bg-white bg-opacity-20 px-4 py-2 rounded-lg hover:bg-opacity-30"
              >
                Reiniciar Demo
              </button>
              <a 
                href="/"
                className="text-white bg-white bg-opacity-20 px-4 py-2 rounded-lg hover:bg-opacity-30"
              >
                ← Volver
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          
          {/* Mobile Phone Mockup */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="bg-black rounded-[2.5rem] p-2" style={{width: '320px', height: '640px'}}>
                <div className="bg-white rounded-[2rem] h-full relative overflow-hidden">
                  
                  {/* Status Bar */}
                  <div className="bg-black h-8 rounded-t-[2rem] flex items-center justify-center">
                    <div className="bg-white rounded-full w-32 h-1"></div>
                  </div>
                  
                  <div className="p-6 h-full bg-gray-50 overflow-y-auto">
                    
                    {!selectedBusiness && !showReward && (
                      <div className="text-center space-y-6">
                        <div className="mb-8">
                          <h2 className="text-xl font-bold text-gray-800 mb-2">Selecciona un Negocio</h2>
                          <p className="text-sm text-gray-600">Elige dónde quieres usar tu tarjeta de fidelidad</p>
                        </div>
                        
                        <div className="space-y-3">
                          {businesses.map(business => (
                            <button
                              key={business.id}
                              onClick={() => handleBusinessSelect(business)}
                              className="w-full p-4 bg-white rounded-xl shadow-sm border flex items-center gap-3 hover:shadow-md transition-shadow"
                            >
                              <span className="text-2xl">{business.emoji}</span>
                              <div className="text-left">
                                <div className="font-medium text-gray-800">{business.name}</div>
                                <div className="text-sm text-gray-600">{business.category}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedBusiness && !showReward && (
                      <div className="space-y-6">
                        <div className="text-center">
                          <div className="text-4xl mb-2">{businesses.find(b => b.id === selectedBusiness.id)?.emoji}</div>
                          <h2 className="text-xl font-bold text-gray-800">{selectedBusiness.name}</h2>
                          <p className="text-sm text-gray-600">{selectedBusiness.category}</p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl p-6">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-sm opacity-90">Tu progreso</span>
                            <span className="text-sm opacity-90">{customerStamps}/{selectedBusiness.stampsRequired}</span>
                          </div>
                          
                          <div className="grid grid-cols-5 gap-2 mb-4">
                            {Array.from({length: selectedBusiness.stampsRequired}).map((_, i) => (
                              <div
                                key={i}
                                className={`aspect-square rounded-full border-2 border-white flex items-center justify-center text-lg ${
                                  i < customerStamps 
                                    ? 'bg-white text-blue-600' 
                                    : 'bg-transparent text-white'
                                }`}
                              >
                                {i < customerStamps ? '⭐' : ''}
                              </div>
                            ))}
                          </div>
                          
                          <div className="text-center">
                            <p className="text-sm opacity-90 mb-2">
                              {selectedBusiness.stampsRequired - customerStamps} sellos más para tu
                            </p>
                            <p className="font-bold text-lg">{selectedBusiness.reward}</p>
                          </div>
                        </div>

                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                              <div className="text-2xl mb-1">🏆</div>
                              <div className="text-sm text-gray-600">Recompensas</div>
                              <div className="font-bold text-lg">2</div>
                            </div>
                            <div>
                              <div className="text-2xl mb-1">⭐</div>
                              <div className="text-sm text-gray-600">Nivel</div>
                              <div className="font-bold text-lg">Gold</div>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={handleAddStamp}
                          className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors"
                        >
                          ✅ Confirmar Compra (+1 Sello)
                        </button>

                        <button
                          onClick={() => setSelectedBusiness(null)}
                          className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                        >
                          ← Cambiar Negocio
                        </button>
                      </div>
                    )}

                    {showReward && selectedBusiness && (
                      <div className="text-center space-y-6 pt-8">
                        <div className="text-6xl mb-4">🎉</div>
                        <h2 className="text-2xl font-bold text-gray-800">¡Felicidades!</h2>
                        <p className="text-gray-600">Has ganado tu recompensa</p>
                        
                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl p-6">
                          <div className="text-3xl mb-2">🎁</div>
                          <div className="font-bold text-xl">{selectedBusiness.reward}</div>
                          <div className="text-sm opacity-90 mt-2">en {selectedBusiness.name}</div>
                        </div>

                        <div className="bg-white rounded-xl p-4 border-2 border-dashed border-green-300">
                          <div className="text-lg font-bold text-gray-800 mb-2">Código de Canje</div>
                          <div className="text-2xl font-mono bg-gray-100 py-2 px-4 rounded">MST-{Math.floor(Math.random() * 10000)}</div>
                          <p className="text-sm text-gray-600 mt-2">Muestra este código al personal</p>
                        </div>

                        <button
                          onClick={resetDemo}
                          className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                        >
                          Continuar Demo
                        </button>
                      </div>
                    )}

                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info Panel */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Experiencia del Cliente
              </h2>
              <p className="text-blue-200 text-lg leading-relaxed">
                Así es como tus clientes interactuarán con tu programa de fidelidad. 
                Simple, rápido y efectivo.
              </p>
            </div>

            {/* Instructions */}
            <div className="space-y-4">
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 border border-white border-opacity-20">
                <div className="flex items-center gap-4 mb-3">
                  <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <h3 className="text-xl font-semibold text-white">Selecciona Negocio</h3>
                </div>
                <p className="text-blue-200">
                  El cliente elige el negocio donde quiere usar su tarjeta de fidelidad.
                </p>
              </div>

              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 border border-white border-opacity-20">
                <div className="flex items-center gap-4 mb-3">
                  <div className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <h3 className="text-xl font-semibold text-white">Ve su Progreso</h3>
                </div>
                <p className="text-blue-200">
                  Visualiza claramente cuántos sellos tiene y cuántos le faltan para la recompensa.
                </p>
              </div>

              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 border border-white border-opacity-20">
                <div className="flex items-center gap-4 mb-3">
                  <div className="bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <h3 className="text-xl font-semibold text-white">Obtiene Recompensa</h3>
                </div>
                <p className="text-blue-200">
                  Al completar el programa, recibe un código de canje que puede usar inmediatamente.
                </p>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 border border-white border-opacity-20">
              <h3 className="text-xl font-semibold text-white mb-4">Ventajas vs Competencia</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-blue-200">Sin descargas - Solo escanear QR</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-blue-200">Setup en 5 minutos</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-blue-200">€19/mes vs €29-69/mes competencia</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-blue-200">Dashboard completo incluido</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="bg-white bg-opacity-10 backdrop-blur rounded-2xl p-8 border border-white border-opacity-20">
            <h3 className="text-2xl font-bold text-white mb-4">
              ¿Listo para tu propio programa?
            </h3>
            <p className="text-blue-200 mb-6">
              Configura tu programa de fidelidad en menos de 5 minutos
            </p>
            <div className="flex gap-4 justify-center">
              <a 
                href="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-colors"
              >
                Comenzar Gratis
              </a>
              <a 
                href="/"
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-8 py-3 rounded-xl font-bold transition-colors"
              >
                Ver Más Info
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}