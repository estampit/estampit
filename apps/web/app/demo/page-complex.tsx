'use client'

import { useState } from 'react'
import { api, Business } from '../../lib/mockapi'
import { QrCode, Star, Gift, Smartphone, Award } from 'lucide-react'

export default function DemoPage() {
  const [activeView, setActiveView] = useState<'scan' | 'customer' | 'reward'>('scan')
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)
  const [customerData, setCustomerData] = useState({
    name: 'María García',
    stamps: 7,
    totalRewards: 2,
    level: 'Bronce'
  })

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
    setActiveView('customer')
  }

  const handleAddStamp = () => {
    if (!selectedBusiness) return
    
    const newStamps = customerData.stamps + 1
    
    if (newStamps >= selectedBusiness.stampsRequired) {
      setCustomerData(prev => ({
        ...prev,
        stamps: 0,
        totalRewards: prev.totalRewards + 1
      }))
      setActiveView('reward')
    } else {
      setCustomerData(prev => ({
        ...prev,
        stamps: newStamps
      }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-black bg-opacity-20 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-4xl mr-4">🎯</div>
              <div>
                <h1 className="text-3xl font-bold text-white">MYSTAMP</h1>
                <p className="text-blue-200">Experiencia del Cliente - Demo Interactivo</p>
              </div>
            </div>
            <div className="text-white text-sm bg-white bg-opacity-20 px-4 py-2 rounded-lg">
              Demo Live
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
                  
                  <div className="p-6 h-full bg-gray-50">
                    
                    {activeView === 'scan' && (
                      <div className="text-center space-y-6">
                        <div className="mb-8">
                          <h2 className="text-xl font-bold text-gray-800 mb-2">Escanear QR</h2>
                          <p className="text-sm text-gray-600">Busca el código QR en tu negocio favorito</p>
                        </div>
                        
                        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-dashed border-gray-300">
                          <QrCode size={120} className="mx-auto text-gray-400 mb-4" />
                          <p className="text-sm text-gray-500">Apunta la cámara al QR</p>
                        </div>
                        
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-gray-700">O selecciona un negocio:</p>
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

                    {activeView === 'customer' && selectedBusiness && (
                      <div className="space-y-6">
                        <div className="text-center">
                          <div className="text-4xl mb-2">{businesses.find(b => b.id === selectedBusiness.id)?.emoji}</div>
                          <h2 className="text-xl font-bold text-gray-800">{selectedBusiness.name}</h2>
                          <p className="text-sm text-gray-600">{selectedBusiness.category}</p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-purple-500 to-blue-600 text-white rounded-xl p-6">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-sm opacity-90">Tu progreso</span>
                            <span className="text-sm opacity-90">{customerData.stamps}/{selectedBusiness.stampsRequired}</span>
                          </div>
                          
                          <div className="grid grid-cols-5 gap-2 mb-4">
                            {Array.from({length: selectedBusiness.stampsRequired}).map((_, i) => (
                              <div
                                key={i}
                                className={`aspect-square rounded-full border-2 border-white flex items-center justify-center text-lg ${
                                  i < customerData.stamps 
                                    ? 'bg-white text-purple-600' 
                                    : 'bg-transparent text-white'
                                }`}
                              >
                                {i < customerData.stamps ? '⭐' : ''}
                              </div>
                            ))}
                          </div>
                          
                          <div className="text-center mb-4">
                            <p className="text-sm opacity-90 mb-2">
                              {selectedBusiness.stampsRequired - customerData.stamps} sellos más para tu
                            </p>
                            <p className="font-bold text-lg">{selectedBusiness.reward}</p>
                          </div>

                          {/* Expiration Date */}
                          <div className="text-center border-t border-white border-opacity-20 pt-3">
                            <div className="text-xs opacity-75">Vence el</div>
                            <div className="text-sm font-medium">
                              {new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES')}
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="grid grid-cols-2 gap-4 text-center mb-4">
                            <div>
                              <div className="text-2xl mb-1">🏆</div>
                              <div className="text-sm text-gray-600">Recompensas</div>
                              <div className="font-bold text-lg">{customerData.totalRewards}</div>
                            </div>
                            <div>
                              <div className="text-2xl mb-1">⭐</div>
                              <div className="text-sm text-gray-600">Nivel</div>
                              <div className="font-bold text-lg">{customerData.level}</div>
                            </div>
                          </div>
                          
                          <div className="border-t pt-3">
                            <div className="text-sm font-medium text-gray-700 mb-2">Últimas compras:</div>
                            <div className="space-y-2 text-xs text-gray-600">
                              <div className="flex justify-between">
                                <span>Cappuccino + Croissant</span>
                                <span>Hace 2 días</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Latte + Sandwich</span>
                                <span>Hace 5 días</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={handleAddStamp}
                          className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-purple-700 transition-colors"
                        >
                          ✅ Confirmar Compra (+1 Sello)
                        </button>

                        <button
                          onClick={() => setActiveView('scan')}
                          className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                        >
                          ← Volver al escáner
                        </button>
                      </div>
                    )}

                    {activeView === 'reward' && selectedBusiness && (
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
                          onClick={() => {
                            setActiveView('scan')
                            setSelectedBusiness(null)
                          }}
                          className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold hover:bg-purple-700 transition-colors"
                        >
                          Continuar comprando
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
                Esta es la experiencia que tendrán tus clientes con MYSTAMP. 
                Simple, intuitiva y efectiva.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-6">
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 border border-white border-opacity-20">
                <div className="flex items-center gap-4 mb-3">
                  <div className="bg-purple-500 p-2 rounded-lg">
                    <QrCode className="text-white" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Escaneo QR Rápido</h3>
                </div>
                <p className="text-blue-200">
                  Los clientes escanean el QR de tu negocio y acceden instantáneamente a su tarjeta de fidelidad digital.
                </p>
              </div>

              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 border border-white border-opacity-20">
                <div className="flex items-center gap-4 mb-3">
                  <div className="bg-green-500 p-2 rounded-lg">
                    <Star className="text-white" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Progreso Visual</h3>
                </div>
                <p className="text-blue-200">
                  Cada compra se registra automáticamente y el cliente ve su progreso hacia la próxima recompensa.
                </p>
              </div>

              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 border border-white border-opacity-20">
                <div className="flex items-center gap-4 mb-3">
                  <div className="bg-orange-500 p-2 rounded-lg">
                    <Gift className="text-white" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Recompensas Instantáneas</h3>
                </div>
                <p className="text-blue-200">
                  Al completar el programa, reciben un código de canje que pueden usar inmediatamente.
                </p>
              </div>
            </div>

            {/* Advantages vs Competitors */}
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 border border-white border-opacity-20">
              <h3 className="text-xl font-semibold text-white mb-4">Ventajas vs Competencia</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-blue-200">70% más rápido que apps tradicionales</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-blue-200">Sin descargas ni registros complejos</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-blue-200">Funciona en cualquier smartphone</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-blue-200">Integración con Apple/Google Wallet</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="bg-white bg-opacity-10 backdrop-blur rounded-2xl p-8 border border-white border-opacity-20">
            <h3 className="text-2xl font-bold text-white mb-4">
              ¿Listo para revolucionar tu negocio?
            </h3>
            <p className="text-blue-200 mb-6">
              Únete a MYSTAMP y ofrece la mejor experiencia de fidelización a tus clientes
            </p>
            <div className="flex gap-4 justify-center">
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-bold transition-colors">
                Comenzar Gratis
              </button>
              <button className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-8 py-3 rounded-xl font-bold transition-colors">
                Ver Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}