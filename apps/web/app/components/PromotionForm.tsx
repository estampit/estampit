'use client'
import { useState, FormEvent } from 'react'
import { createPromotion } from '@/actions/promotions'
import toast from 'react-hot-toast'

export function PromotionForm({ businessId, loyaltyCardId }: { businessId: string; loyaltyCardId?: string }) {
  const [name, setName] = useState('')
  const [type, setType] = useState('extra_stamp')
  const [stampsRequired, setStampsRequired] = useState(10)
  const [rewardDescription, setRewardDescription] = useState('')
  const [productName, setProductName] = useState('')
  const [priority, setPriority] = useState(100)
  const [endsAt, setEndsAt] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error('El nombre de la promoción es obligatorio')
      return
    }
    
    if ((type === 'reward_boost' || type === 'birthday' || type === 'happy_hour' || type === 'custom') && !rewardDescription.trim()) {
      toast.error('La descripción de la recompensa es obligatoria para este tipo de promoción')
      return
    }

    setIsSubmitting(true)
    
    const config: Record<string, any> = {}
    
    // Configurar según el tipo de promoción
    switch (type) {
      case 'extra_stamp':
        config.extra_stamps = 1 // Da 1 sello extra
        config.min_stamps = stampsRequired
        break
      case 'multiplier':
        config.multiplier = 2 // Duplica sellos
        config.min_stamps = stampsRequired
        break
      case 'reward_boost':
        config.reward_description = rewardDescription
        config.product_name = productName
        config.min_stamps = stampsRequired
        break
      case 'birthday':
        config.reward_description = rewardDescription || 'Recompensa de cumpleaños'
        config.min_stamps = stampsRequired
        break
      case 'happy_hour':
        config.reward_description = rewardDescription || 'Descuento happy hour'
        config.min_stamps = stampsRequired
        break
      case 'custom':
        config.reward_description = rewardDescription
        config.product_name = productName
        config.min_stamps = stampsRequired
        break
    }

    try {
      const res = await createPromotion({ 
        businessId, 
        loyaltyCardId, 
        name: name.trim(), 
        promoType: type,
        config,
        priority,
        endsAt: endsAt || null
      })
      
      if (res.success) {
        toast.success('¡Promoción creada exitosamente!')
        // Limpiar formulario
        setName('')
        setRewardDescription('')
        setProductName('')
        setStampsRequired(10)
        setPriority(100)
        setEndsAt('')
        setType('extra_stamp')
      } else {
        toast.error(`Error al crear promoción: ${res.error}`)
      }
    } catch (error) {
      console.error('Error creating promotion:', error)
      toast.error('Error inesperado al crear la promoción')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = name.trim() && 
    (type === 'extra_stamp' || type === 'multiplier' || rewardDescription.trim())

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Nueva Promoción</h3>
          <p className="text-sm text-gray-600">Crea una nueva promoción para tus clientes</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Nombre de la promoción <span className="text-red-500">*</span>
            </label>
            <input 
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
              placeholder="Ej: 2x1 en cafés" 
              value={name} 
              onChange={e=>setName(e.target.value)} 
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Tipo de promoción</label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
              value={type} 
              onChange={e=>setType(e.target.value)}
            >
              <option value="extra_stamp">Sello Extra (+1 sello adicional)</option>
              <option value="multiplier">Multiplicador (duplica sellos)</option>
              <option value="reward_boost">Recompensa Especial</option>
              <option value="birthday">Cumpleaños</option>
              <option value="happy_hour">Happy Hour</option>
              <option value="custom">Personalizada</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Sellos necesarios <span className="text-red-500">*</span>
            </label>
            <input 
              type="number" 
              min="1" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
              value={stampsRequired} 
              onChange={e=>setStampsRequired(parseInt(e.target.value) || 10)} 
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Prioridad</label>
            <input 
              type="number" 
              min="1" 
              max="999" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
              value={priority} 
              onChange={e=>setPriority(parseInt(e.target.value) || 100)} 
            />
            <p className="text-xs text-gray-500">Mayor número = mayor prioridad</p>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Fecha de expiración</label>
            <input 
              type="date" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
              value={endsAt} 
              onChange={e=>setEndsAt(e.target.value)} 
            />
            <p className="text-xs text-gray-500">Opcional</p>
          </div>
        </div>

        {(type === 'reward_boost' || type === 'birthday' || type === 'happy_hour' || type === 'custom') && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Descripción de la recompensa <span className="text-red-500">*</span>
            </label>
            <input 
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
              placeholder="Ej: Café gratis, descuento 50%, etc." 
              value={rewardDescription} 
              onChange={e=>setRewardDescription(e.target.value)} 
              required
            />
          </div>
        )}

        {(type === 'reward_boost' || type === 'custom') && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Producto específico</label>
            <input 
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
              placeholder="Ej: Café latte, hamburguesa, etc." 
              value={productName} 
              onChange={e=>setProductName(e.target.value)} 
            />
            <p className="text-xs text-gray-500">Opcional - especifica el producto para la recompensa</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {type === 'extra_stamp' && `Los clientes recibirán 1 sello extra después de ${stampsRequired} sellos`}
            {type === 'multiplier' && `Los sellos se duplicarán después de ${stampsRequired} sellos`}
            {(type === 'reward_boost' || type === 'birthday' || type === 'happy_hour' || type === 'custom') && 
              `Recompensa: ${rewardDescription || 'Por definir'}`}
          </div>
          
          <button 
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creando...
              </>
            ) : (
              <>
                <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Crear Promoción
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
