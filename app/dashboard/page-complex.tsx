'use client'

import { useState, useEffect, useTransition } from 'react'
import { useAuth } from '../../lib/auth'
import { fetchCustomerDashboardData, addStampWithPromotions, fetchFirstLoyaltyCard, fetchPromotions, togglePromotionActive, createPromotion, fetchRecentPurchases, addPurchaseWithStamp, generateWalletPass, redeemWalletPassToken, revokeWalletPass, regenerateWalletPass, fetchBusinessAnalytics, fetchBusinessFeatures } from '../../lib/dataAdapter'
import { WalletPassQR } from '../../components/WalletPassQR'
import { initBusiness } from '../actions/initBusiness'
import { createCustomerAction } from '../actions/createCustomer'
import { toast } from 'react-hot-toast'
import { 
  Users, 
  Award, 
  TrendingUp, 
  Star, 
  Plus, 
  Search,
  LogOut,
  QrCode,
  BarChart3,
  Gift,
  Smartphone
} from 'lucide-react'

export default function DashboardPage() {
  const { business, signOut } = useAuth()
  const [customers, setCustomers] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [analyticsDays, setAnalyticsDays] = useState(30)
  const [loyaltyCard, setLoyaltyCard] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [promotions, setPromotions] = useState<any[]>([])
  const [purchases, setPurchases] = useState<any[]>([])
  const [showAddPurchase, setShowAddPurchase] = useState(false)
  const [newPurchase, setNewPurchase] = useState({ amount: 0, customerCardId: '', items: '' })
  const [walletPassToken, setWalletPassToken] = useState<string | null>(null)
  const [walletPassId, setWalletPassId] = useState<string | null>(null)
  const [selectedWalletCustomer, setSelectedWalletCustomer] = useState('')
  const [redeemTokenInput, setRedeemTokenInput] = useState('')
  const [features, setFeatures] = useState<any>(null)
  const [showAddPromotion, setShowAddPromotion] = useState(false)
  const [newPromotion, setNewPromotion] = useState({
    name: '',
    type: 'bonus_stamps',
    value: 1,
    description: ''
  })
  const [isLoading, setIsLoading] = useState(true)
  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: ''
  })

  useEffect(() => {
    if (business) {
      loadData()
    }
  }, [business])

  const loadData = async () => {
    if (!business) return
    
    try {
  const customersData = await fetchCustomerDashboardData(business.id)
  const card = await fetchFirstLoyaltyCard(business.id)
  setLoyaltyCard(card)
  const f = await fetchBusinessFeatures(business.id)
  setFeatures(f)
  const promos = f?.promotions ? await fetchPromotions(business.id) : []
  setPromotions(promos)
  const recent = await fetchRecentPurchases(business.id, 30)
  setPurchases(recent)
      setCustomers(customersData as any[])
  const analyticsData = await fetchBusinessAnalytics(business.id, analyticsDays)
      setAnalytics(analyticsData)
    } catch (error) {
      toast.error('Error loading data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!business || !loyaltyCard) return
    const res = await createCustomerAction({
      email: newCustomer.email,
      name: newCustomer.name,
      businessId: business.id,
      loyaltyCardId: loyaltyCard.id
    })
    if (res.error) {
      toast.error(res.error)
      return
    }
    toast.success('Cliente creado')
    setNewCustomer({ name: '', email: '', phone: '' })
    setShowAddCustomer(false)
    await loadData()
  }

  const handleAddStamp = async (customerCardId: string) => {
    if (!business) return
    try {
      const result = await addStampWithPromotions(customerCardId, business.id)
      await loadData()
      const promos = (result?.applied_promotions || []).length
      toast.success(`Sellos añadidos (${result?.final_stamps_added})${promos ? ' + promos' : ''}`)
    } catch (e: any) {
      toast.error('Error al añadir sello')
    }
  }

  const filteredCustomers = customers.filter(customer =>
    (customer.customer_email || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreatePromotion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!business) return
    try {
      await createPromotion({
        businessId: business.id,
        loyaltyCardId: loyaltyCard?.id,
        name: newPromotion.name,
        type: newPromotion.type,
        description: newPromotion.description,
        config: { bonus_stamps: Number(newPromotion.value) }
      })
      toast.success('Promoción creada')
      setShowAddPromotion(false)
      setNewPromotion({ name: '', type: 'bonus_stamps', value: 1, description: '' })
      await loadData()
    } catch (e:any) {
      toast.error('Error creando promoción')
    }
  }

  const handleTogglePromotion = async (id: string, state: boolean) => {
    try {
      await togglePromotionActive(id, state)
      await loadData()
    } catch (e:any) {
      toast.error('Error actualizando promoción')
    }
  }

  const [isPending, startTransition] = useTransition()

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-10 rounded-xl shadow-sm max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Configura tu Negocio</h1>
          <p className="text-gray-600 mb-6 text-sm">Aún no tienes un negocio inicializado. Pulsa el botón para crear automáticamente un negocio y un programa de fidelización base.</p>
          <button
            disabled={isPending}
            onClick={() => startTransition(async () => {
              const res = await initBusiness()
              if (res.error) {
                toast.error(res.error)
              } else {
                toast.success('Negocio inicializado')
                // Forzar recarga de datos (session listener en AuthProvider actualizará)
                window.location.reload()
              }
            })}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50"
          >
            {isPending ? 'Creando...' : 'Crear Negocio y Programa'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-3xl mr-3">🎯</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">MYSTAMP</h1>
                <p className="text-sm text-gray-600">{business.name}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut size={20} />
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Dashboard', icon: BarChart3 },
              { id: 'customers', label: 'Clientes', icon: Users },
              { id: 'promotions', label: 'Promos', icon: Gift },
              { id: 'purchases', label: 'Historial', icon: Gift },
              { id: 'loyalty', label: 'Programa', icon: Award },
              { id: 'mobile', label: 'App Preview', icon: Smartphone }
            ].map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-600 hover:text-purple-600'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="flex justify-end">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Periodo:</span>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={analyticsDays}
                  onChange={async (e) => {
                    const v = Number(e.target.value)
                    setAnalyticsDays(v)
                    if (business) {
                      try {
                        const data = await fetchBusinessAnalytics(business.id, v)
                        setAnalytics(data)
                      } catch (err:any) {
                        toast.error('Error analytics')
                      }
                    }
                  }}
                >
                  <option value={7}>7d</option>
                  <option value={30}>30d</option>
                  <option value={90}>90d</option>
                </select>
              </div>
            </div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="text-blue-600" size={24} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Clientes</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics?.total_customers || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Star className="text-green-600" size={24} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Sellos Dados</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics?.total_stamps || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Gift className="text-purple-600" size={24} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Recompensas</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics?.total_rewards || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <TrendingUp className="text-orange-600" size={24} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Sellos/Cliente</p>
                    <p className="text-2xl font-bold text-gray-900">{Number(analytics?.avg_stamps_per_customer || 0).toFixed(1)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Program Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Tu Programa de Fidelización</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-purple-500 to-blue-600 text-white rounded-lg">
                  <div className="text-3xl mb-2">🎯</div>
                  <div className="font-semibold">10 Sellos{/* TODO: fetch from loyalty_card */}</div>
                  <div className="text-sm opacity-90">para obtener</div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="text-4xl">→</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-lg">
                  <div className="text-3xl mb-2">🎁</div>
                  <div className="font-semibold">Café Gratis{/* TODO: reward from loyalty_card */}</div>
                  <div className="text-sm opacity-90">recompensa</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Gestión de Clientes</h2>
              <button
                onClick={() => setShowAddCustomer(true)}
                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus size={18} />
                Añadir Cliente
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar clientes..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Customers List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 font-medium text-gray-700">
                <div className="col-span-3">Cliente</div>
                <div className="col-span-2">Sellos</div>
                <div className="col-span-2">Recompensas</div>
                <div className="col-span-3">Última Visita</div>
                <div className="col-span-2">Acciones</div>
              </div>
              {filteredCustomers.map(customer => (
                <div key={customer.customer_id} className="grid grid-cols-12 gap-4 p-4 border-t items-center hover:bg-gray-50">
                  <div className="col-span-3">
                    <div className="font-medium text-gray-900">{customer.customer_email.split('@')[0]}</div>
                    <div className="text-sm text-gray-600">{customer.customer_email}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">{customer.current_stamps}</span>
                      <span className="text-gray-500">/ {loyaltyCard?.stamps_required ?? 10}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="h-2 bg-purple-500 rounded-full"
                        style={{ width: `${Math.min(100, ((customer.current_stamps || 0) / (loyaltyCard?.stamps_required || 10)) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                      {customer.total_rewards}
                    </span>
                  </div>
                  <div className="col-span-3">
                    <span className="text-sm text-gray-600">
                      {customer.last_stamp_at ? new Date(customer.last_stamp_at).toLocaleDateString('es-ES') : '—'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <button
                      onClick={() => handleAddStamp(customer.customer_card_id)}
                      className="bg-purple-600 text-white px-3 py-1 rounded-md text-sm hover:bg-purple-700 transition-colors"
                    >
                      + Sello
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'promotions' && features?.promotions && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Promociones</h2>
              <button
                onClick={() => setShowAddPromotion(true)}
                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus size={18} />
                Nueva Promo
              </button>
            </div>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 font-medium text-gray-700">
                <div className="col-span-3">Nombre</div>
                <div className="col-span-2">Tipo</div>
                <div className="col-span-2">Inicio</div>
                <div className="col-span-2">Fin</div>
                <div className="col-span-1">Activa</div>
                <div className="col-span-2">Acciones</div>
              </div>
              {promotions.map(promo => (
                <div key={promo.id} className="grid grid-cols-12 gap-4 p-4 border-t items-center hover:bg-gray-50">
                  <div className="col-span-3">
                    <div className="font-medium text-gray-900">{promo.name}</div>
                    <div className="text-xs text-gray-500">{promo.description}</div>
                  </div>
                  <div className="col-span-2 text-sm">{promo.promo_type}</div>
                  <div className="col-span-2 text-sm">{new Date(promo.starts_at).toLocaleDateString('es-ES')}</div>
                  <div className="col-span-2 text-sm">{promo.ends_at ? new Date(promo.ends_at).toLocaleDateString('es-ES') : '—'}</div>
                  <div className="col-span-1">
                    <button
                      onClick={() => handleTogglePromotion(promo.id, !promo.is_active)}
                      className={`px-2 py-1 rounded text-xs font-medium ${promo.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}
                    >
                      {promo.is_active ? 'Sí' : 'No'}
                    </button>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs text-gray-500">Prioridad {promo.priority}</span>
                  </div>
                </div>
              ))}
              {promotions.length === 0 && (
                <div className="p-8 text-center text-gray-500 text-sm">No hay promociones creadas todavía.</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'purchases' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Historial de Compras</h2>
              <button
                onClick={() => setShowAddPurchase(true)}
                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus size={18} /> Registrar Compra
              </button>
            </div>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 font-medium text-gray-700">
                <div className="col-span-3">Cliente</div>
                <div className="col-span-2">Importe</div>
                <div className="col-span-3">Items</div>
                <div className="col-span-2">Sellos</div>
                <div className="col-span-2">Fecha</div>
              </div>
              {purchases.map(p => {
                const cust = customers.find(c => c.customer_id === p.customer_id)
                return (
                  <div key={p.id} className="grid grid-cols-12 gap-4 p-4 border-t items-center hover:bg-gray-50 text-sm">
                    <div className="col-span-3">
                      <div className="font-medium text-gray-900">{cust ? cust.customer_email.split('@')[0] : '—'}</div>
                      <div className="text-xs text-gray-500">{cust?.customer_email}</div>
                    </div>
                    <div className="col-span-2 font-semibold">€{Number(p.amount).toFixed(2)}</div>
                    <div className="col-span-3 truncate">{(p.items || []).map((it:any)=> it.name || it).join(', ')}</div>
                    <div className="col-span-2 flex items-center gap-1"><Star size={14} className="text-purple-600" /> {p.stamps_awarded}</div>
                    <div className="col-span-2 text-xs text-gray-600">{new Date(p.created_at).toLocaleDateString('es-ES')} {new Date(p.created_at).toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'})}</div>
                  </div>
                )
              })}
              {purchases.length === 0 && (
                <div className="p-8 text-center text-gray-500 text-sm">No hay compras registradas aún.</div>
              )}
            </div>

            {/* Top Items */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Productos Más Vendidos</h3>
                <div className="space-y-3">
                  {[
                    { item: 'Cappuccino', sales: 89, revenue: 356.0 },
                    { item: 'Croissant', sales: 67, revenue: 167.5 },
                    { item: 'Latte', sales: 54, revenue: 216.0 },
                    { item: 'Americano', sales: 43, revenue: 129.0 }
                  ].map((product, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-800">{product.item}</div>
                        <div className="text-sm text-gray-600">{product.sales} ventas</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">€{product.revenue.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Clientes Top por Gasto</h3>
                <div className="space-y-3">
                  {customers.sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 4).map((customer, i) => (
                    <div key={customer.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold">
                          {i + 1}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{customer.name}</div>
                          <div className="text-sm text-gray-600">{customer.loyaltyLevel}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">€{customer.totalSpent.toFixed(2)}</div>
                        <div className="text-sm text-gray-600">{customer.totalRewards} recompensas</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'loyalty' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">QR Code del Programa</h2>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Código QR para Clientes</h3>
                  <p className="text-gray-600 mb-4">
                    Los clientes pueden escanear este código para unirse a tu programa de fidelización.
                  </p>
                  <div className="bg-gray-100 p-6 rounded-lg text-center">
                    {walletPassToken ? (
                      <WalletPassQR token={walletPassToken} label="QR Wallet Pass" />
                    ) : (
                      <>
                        <QrCode size={120} className="mx-auto text-gray-600 mb-4" />
                        <p className="text-sm text-gray-600">Genera un pass para ver QR</p>
                      </>
                    )}
                    <p className="text-xs text-gray-500 mt-4">{business.name}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Configuración del Programa</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between p-4 bg-gray-50 rounded-lg">
                      <span className="font-medium">Sellos requeridos:</span>
                      <span>{loyaltyCard?.stamps_required ?? '—'}</span>
                    </div>
                    <div className="flex justify-between p-4 bg-gray-50 rounded-lg">
                      <span className="font-medium">Recompensa:</span>
                      <span>{loyaltyCard?.reward_description ?? '—'}</span>
                    </div>
                    <div className="flex justify-between p-4 bg-gray-50 rounded-lg">
                      <span className="font-medium">Categoría:</span>
                      <span>General</span>
                    </div>
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-800 mb-2">Wallet Pass (QR)</h4>
                      {!features?.promotions && (
                        <div className="text-xs mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-700">
                          Upgrade necesario para habilitar Wallet Pass.
                        </div>
                      )}
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <select
                            className="flex-1 px-3 py-2 border rounded-lg text-sm"
                            value={selectedWalletCustomer}
                            onChange={(e) => setSelectedWalletCustomer(e.target.value)}
                          >
                            <option value="">Cliente...</option>
                            {customers.map(c => (
                              <option key={c.customer_card_id} value={c.customer_card_id}>{c.customer_email}</option>
                            ))}
                          </select>
                          <button
                            disabled={!selectedWalletCustomer || !business || !features?.promotions}
                            onClick={async () => {
                              if (!business || !selectedWalletCustomer) return
                              if (!features?.promotions) { toast.error('No disponible en tu plan'); return }
                              try {
                                const res = await generateWalletPass(business.id, selectedWalletCustomer)
                                setWalletPassToken(res.qr_token)
                                setWalletPassId(res.wallet_pass?.id || null)
                                toast.success(res.reused ? 'Pass reutilizado' : 'Pass generado')
                              } catch (e:any) {
                                toast.error('Error generando pass')
                              }
                            }}
                            className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm disabled:opacity-50"
                          >Generar</button>
                        </div>
                        {walletPassToken && (
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                if (!business || !walletPassId) return
                                try {
                                  await revokeWalletPass(business.id, walletPassId)
                                  toast.success('Pass revocado')
                                  setWalletPassToken(null)
                                  setWalletPassId(null)
                                } catch (e:any) {
                                  toast.error('Error revocando')
                                }
                              }}
                              className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg text-sm"
                            >Revocar</button>
                            <button
                              onClick={async () => {
                                if (!business || !selectedWalletCustomer) return
                                try {
                                  const res = await regenerateWalletPass(business.id, selectedWalletCustomer)
                                  setWalletPassToken(res.qr_token)
                                  setWalletPassId(res.wallet_pass?.id || null)
                                  toast.success('Pass regenerado')
                                } catch (e:any) {
                                  toast.error('Error regenerando')
                                }
                              }}
                              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm"
                            >Regenerar</button>
                          </div>
                        )}
                        {walletPassToken && (
                          <div className="p-3 bg-gray-50 rounded border text-xs break-all">
                            Token: {walletPassToken}
                          </div>
                        )}
                        {walletPassToken && (
                          <div className="bg-white border rounded-lg p-4 text-center">
                            <div className="text-xs text-gray-500 mb-2">Simulación QR (token)</div>
                            <div className="font-mono text-[10px] leading-snug whitespace-pre-wrap break-all bg-gray-100 p-2 rounded">
                              {walletPassToken}
                            </div>
                          </div>
                        )}
                        <div className="pt-2 border-t">
                          <h5 className="text-xs font-semibold text-gray-600 mb-1">Simular escaneo</h5>
                          <form
                            onSubmit={async (e) => {
                              e.preventDefault()
                              if (!business || !redeemTokenInput) return
                              try {
                                const r = await redeemWalletPassToken(business.id, redeemTokenInput.trim())
                                if (r.success) {
                                  toast.success('Sello vía QR')
                                  await loadData()
                                } else {
                                  toast.error(r.error || 'Error')
                                }
                              } catch (e:any) {
                                toast.error('Error canjeando')
                              }
                            }}
                            className="flex gap-2"
                          >
                            <input
                              type="text"
                              placeholder="Token QR..."
                              className="flex-1 px-2 py-1 border rounded text-xs"
                              value={redeemTokenInput}
                              onChange={(e) => setRedeemTokenInput(e.target.value)}
                            />
                            <button className="px-3 py-1 bg-green-600 text-white rounded text-xs">Canjear</button>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mobile' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-800">Preview de la App Móvil</h2>
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Customer App Preview */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Vista del Cliente</h3>
                <div className="bg-gray-900 rounded-2xl p-4 mx-auto" style={{width: '280px', height: '500px'}}>
                  <div className="bg-white rounded-xl h-full p-4 overflow-y-auto">
                    <div className="text-center mb-6">
                      <div className="text-3xl mb-2">🎯</div>
                      <h4 className="font-bold text-lg">{business.name}</h4>
                      <p className="text-sm text-gray-600">General</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-500 to-blue-600 text-white rounded-lg p-4 mb-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm opacity-90">Progreso</span>
                        <span className="text-sm opacity-90">7/10</span>
                      </div>
                      <div className="flex space-x-1 mb-3">
                        {Array.from({length: 10}).map((_, i) => (
                          <div
                            key={i}
                            className={`w-6 h-6 rounded-full border-2 border-white ${
                              i < 7 ? 'bg-white' : 'bg-transparent'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs opacity-90">
                        {10 - 7} sellos más para tu Café Gratis
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm">🏆 Recompensas ganadas</span>
                        <span className="font-bold">2</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm">⭐ Nivel actual</span>
                        <span className="font-bold">Bronce</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Staff App Preview */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Vista del Staff</h3>
                <div className="bg-gray-900 rounded-2xl p-4 mx-auto" style={{width: '280px', height: '500px'}}>
                  <div className="bg-white rounded-xl h-full p-4">
                    <div className="text-center mb-6">
                      <div className="text-2xl mb-2">👨‍💼</div>
                      <h4 className="font-bold">Staff - {business.name}</h4>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <button className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium">
                        📱 Escanear QR Cliente
                      </button>
                      <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium">
                        👤 Buscar Cliente
                      </button>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-medium mb-2">Último Cliente</h5>
                      <div className="text-sm text-gray-600">
                        <div>María García</div>
                        <div>Sellos: 7/10</div>
                        <div className="text-green-600 font-medium">✅ Sello añadido</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Customer Modal */}
      {showAddCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Añadir Nuevo Cliente</h3>
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: María García"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="maria@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono (opcional)
                </label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+34 600 000 000"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddCustomer(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Añadir Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Add Purchase Modal */}
      {showAddPurchase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Registrar Compra</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!business) return;
              if (!newPurchase.customerCardId) { toast.error('Selecciona cliente'); return; }
              try {
                await addPurchaseWithStamp({
                  businessId: business.id,
                  customerCardId: newPurchase.customerCardId,
                  amount: Number(newPurchase.amount),
                  items: newPurchase.items ? newPurchase.items.split(',').map(i => ({ name: i.trim() })) : []
                })
                toast.success('Compra registrada')
                setShowAddPurchase(false)
                setNewPurchase({ amount: 0, customerCardId: '', items: '' })
                await loadData()
              } catch (err:any) {
                toast.error('Error registrando compra')
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={newPurchase.customerCardId}
                  onChange={(e) => setNewPurchase(p => ({ ...p, customerCardId: e.target.value }))}
                  required
                >
                  <option value="">Selecciona cliente...</option>
                  {customers.map(c => (
                    <option key={c.customer_card_id} value={c.customer_card_id}>{c.customer_email}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Importe (€)</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={newPurchase.amount}
                    onChange={(e) => setNewPurchase(p => ({ ...p, amount: Number(e.target.value) }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Items (coma)</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={newPurchase.items}
                    onChange={(e) => setNewPurchase(p => ({ ...p, items: e.target.value }))}
                    placeholder="Café, Croissant"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddPurchase(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Add Promotion Modal */}
      {showAddPromotion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Nueva Promoción</h3>
            <form onSubmit={handleCreatePromotion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={newPromotion.name}
                  onChange={(e) => setNewPromotion(p => ({ ...p, name: e.target.value }))}
                  placeholder="Ej: Promo Doble Sello"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={newPromotion.description}
                  onChange={(e) => setNewPromotion(p => ({ ...p, description: e.target.value }))}
                  placeholder="Detalle opcional"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={newPromotion.type}
                    onChange={(e) => setNewPromotion(p => ({ ...p, type: e.target.value }))}
                  >
                    <option value="bonus_stamps">Bonus Stamps</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                  <input
                    type="number"
                    min={1}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={newPromotion.value}
                    onChange={(e) => setNewPromotion(p => ({ ...p, value: Number(e.target.value) }))}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddPromotion(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}