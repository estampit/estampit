'use client'
import { useState, FormEvent, useRef } from 'react'
import { uploadBusinessLogo, updateBusinessAppearance } from '@/actions/business'
import toast from 'react-hot-toast'

interface BusinessAppearance {
  logo_url?: string
  primary_color?: string
  secondary_color?: string
  background_color?: string
  text_color?: string
  card_title?: string
  card_description?: string
}

interface BusinessAppearanceFormProps {
  businessId: string
  businessName: string
  currentAppearance?: BusinessAppearance
  onUpdate?: (appearance: BusinessAppearance) => void
}

export function BusinessAppearanceForm({ 
  businessId, 
  businessName, 
  currentAppearance = {}, 
  onUpdate 
}: BusinessAppearanceFormProps) {
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(currentAppearance.logo_url || null)
  const [primaryColor, setPrimaryColor] = useState(currentAppearance.primary_color || '#2563eb')
  const [secondaryColor, setSecondaryColor] = useState(currentAppearance.secondary_color || '#64748b')
  const [backgroundColor, setBackgroundColor] = useState(currentAppearance.background_color || '#ffffff')
  const [textColor, setTextColor] = useState(currentAppearance.text_color || '#1f2937')
  const [cardTitle, setCardTitle] = useState(currentAppearance.card_title || businessName)
  const [cardDescription, setCardDescription] = useState(currentAppearance.card_description || 'Programa de fidelización')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadLogo = async () => {
    if (!logoFile) return
    setUploading(true)
    try {
      const res = await uploadBusinessLogo(businessId, logoFile)
      if (res.success) {
        setLogoPreview(res.logo_url!)
        toast.success('Logo subido correctamente')
        onUpdate?.({ ...currentAppearance, logo_url: res.logo_url })
      } else {
        toast.error('Error subiendo logo: ' + res.error)
      }
    } catch (error) {
      toast.error('Error subiendo logo')
    } finally {
      setUploading(false)
    }
  }

  const handleSaveAppearance = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const appearance = {
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        background_color: backgroundColor,
        text_color: textColor,
        card_title: cardTitle,
        card_description: cardDescription
      }
      const res = await updateBusinessAppearance(businessId, appearance)
      if (res.success) {
        toast.success('Apariencia guardada correctamente')
        onUpdate?.({ ...currentAppearance, ...appearance, logo_url: logoPreview || undefined })
      } else {
        toast.error('Error guardando apariencia: ' + res.error)
      }
    } catch (error) {
      toast.error('Error guardando apariencia')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Configuración de Apariencia */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Configuración de Apariencia</h3>
          
          {/* Logo */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Logo de la tienda</label>
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Seleccionar Logo
              </button>
              {logoFile && (
                <button
                  type="button"
                  onClick={handleUploadLogo}
                  disabled={uploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploading ? 'Subiendo...' : 'Subir Logo'}
                </button>
              )}
            </div>
            {logoPreview && (
              <div className="mt-2">
                <img src={logoPreview} alt="Logo preview" className="h-16 w-16 object-contain border rounded" />
              </div>
            )}
          </div>

          {/* Colores */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-sm font-medium">Color Principal</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={e => setPrimaryColor(e.target.value)}
                  className="w-12 h-8 border rounded"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={e => setPrimaryColor(e.target.value)}
                  className="flex-1 px-2 py-1 border rounded text-sm"
                  placeholder="#2563eb"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium">Color Secundario</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={e => setSecondaryColor(e.target.value)}
                  className="w-12 h-8 border rounded"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={e => setSecondaryColor(e.target.value)}
                  className="flex-1 px-2 py-1 border rounded text-sm"
                  placeholder="#64748b"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium">Fondo</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={e => setBackgroundColor(e.target.value)}
                  className="w-12 h-8 border rounded"
                />
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={e => setBackgroundColor(e.target.value)}
                  className="flex-1 px-2 py-1 border rounded text-sm"
                  placeholder="#ffffff"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium">Texto</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={textColor}
                  onChange={e => setTextColor(e.target.value)}
                  className="w-12 h-8 border rounded"
                />
                <input
                  type="text"
                  value={textColor}
                  onChange={e => setTextColor(e.target.value)}
                  className="flex-1 px-2 py-1 border rounded text-sm"
                  placeholder="#1f2937"
                />
              </div>
            </div>
          </div>

          {/* Texto de la tarjeta */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Título de la tarjeta</label>
            <input
              type="text"
              value={cardTitle}
              onChange={e => setCardTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              placeholder="Programa de Fidelización"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Descripción de la tarjeta</label>
            <input
              type="text"
              value={cardDescription}
              onChange={e => setCardDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              placeholder="Acumula sellos y obtén recompensas"
            />
          </div>

          <button
            type="button"
            onClick={handleSaveAppearance}
            disabled={saving}
            className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar Apariencia'}
          </button>
        </div>

        {/* Previsualización */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Previsualización de la Tarjeta</h3>
          <LoyaltyCardPreview
            logoUrl={logoPreview}
            title={cardTitle}
            description={cardDescription}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            backgroundColor={backgroundColor}
            textColor={textColor}
          />
        </div>
      </div>
    </div>
  )
}

// Componente de previsualización de la tarjeta de fidelización
interface LoyaltyCardPreviewProps {
  logoUrl?: string | null
  title: string
  description: string
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  textColor: string
}

function LoyaltyCardPreview({
  logoUrl,
  title,
  description,
  primaryColor,
  secondaryColor,
  backgroundColor,
  textColor
}: LoyaltyCardPreviewProps) {
  return (
    <div className="border rounded-lg overflow-hidden shadow-lg max-w-sm mx-auto">
      {/* Header con colores */}
      <div 
        className="p-4 text-white relative"
        style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
      >
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="h-12 w-12 rounded bg-white/20 p-1" />
          ) : (
            <div className="h-12 w-12 rounded bg-white/20 flex items-center justify-center text-xs">
              LOGO
            </div>
          )}
          <div>
            <h3 className="font-bold text-lg">{title}</h3>
            <p className="text-sm opacity-90">{description}</p>
          </div>
        </div>
      </div>

      {/* Contenido de la tarjeta */}
      <div 
        className="p-4"
        style={{ backgroundColor, color: textColor }}
      >
        <div className="space-y-3">
          {/* Sellos */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Sellos acumulados</span>
              <span className="text-sm">3 / 10</span>
            </div>
            <div className="flex gap-1 flex-wrap">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-6 h-6 rounded-full border-2 ${
                    i < 3 
                      ? 'bg-current border-current' 
                      : 'border-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Próxima recompensa */}
          <div className="border-t pt-3">
            <div className="text-sm">
              <div className="font-medium">Próxima recompensa:</div>
              <div className="text-gray-600">7 sellos más para obtener un café gratis</div>
            </div>
          </div>

          {/* QR Code placeholder */}
          <div className="border-t pt-3 flex justify-center">
            <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
              <div className="text-xs text-gray-500 text-center">
                QR Code<br/>para escanear
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div 
        className="p-3 text-center text-xs"
        style={{ backgroundColor: secondaryColor, color: 'white' }}
      >
        Programa de fidelización • Escanea para acumular sellos
      </div>
    </div>
  )
}