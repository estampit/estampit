import { getServerSupabase } from '@/lib/supabaseServer'
import Link from 'next/link'
import { CustomerCardsList } from '@/app/components/CustomerCardsList'

export default async function MyPage() {
  const supabase = await getServerSupabase()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Acceso requerido</h2>
            <p className="mt-2 text-sm text-gray-600">
              Necesitas iniciar sesión para ver tu dashboard.
            </p>
            <div className="mt-6">
              <Link
                href="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Iniciar sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Simular un usuario para testing
  const mockUser = {
    id: '8505af2a-f1cc-4a08-8922-6eda657f982e',
    email: 'test4@example.com'
  }

  // Usar el usuario simulado para testing
  const user = mockUser

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, email')
    .eq('id', user.id)
    .single()

  // Get customer cards with business info
  const { data: customerCards } = await supabase
    .from('customer_cards')
    .select(`
      id,
      current_stamps,
      created_at,
      loyalty_card:loyalty_cards!inner(
        id,
        name,
        stamps_required,
        reward_description,
        business:businesses!inner(
          id,
          name
        )
      )
    `)
    .eq('customer_id', mockUser.id)

  // Transform data for CustomerCardsList component
  const availableCards = (customerCards as any[])?.map(card => ({
    id: card.loyalty_card.id,
    name: card.loyalty_card.name,
    business_name: card.loyalty_card.business.name,
    business_id: card.loyalty_card.business.id,
    current_stamps: card.current_stamps,
    stamps_required: card.loyalty_card.stamps_required,
    reward_description: card.loyalty_card.reward_description,
    customer_card_id: card.id
  })) || []

  const userProfile = profile as any

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Hola, {userProfile ? userProfile.name : 'Cliente'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Gestiona tus tarjetas de fidelización y recompensas
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">{userProfile ? userProfile.email : user.email}</p>
              <Link
                href="/test-wallet"
                className="inline-flex items-center px-3 py-1 mt-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Probar Wallet
              </Link>
            </div>
          </div>
        </div>

        {/* Customer Cards */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Mis Tarjetas</h2>
            <p className="text-sm text-gray-600 mt-1">
              Tarjetas de fidelización a las que estás asociado
            </p>
          </div>

          {availableCards.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                No tienes tarjetas aún
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Únete a un negocio escaneando su código QR o usando un enlace de invitación.
              </p>
              <Link
                href="/join"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Explorar negocios
              </Link>
            </div>
          ) : (
            <CustomerCardsList available={availableCards} />
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/test-wallet"
            className="bg-white shadow rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Probar Wallet Pass</h3>
                <p className="text-sm text-gray-600">Descarga y prueba tus passes en Apple Wallet</p>
              </div>
            </div>
          </Link>

          <div className="bg-white shadow rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Recompensas</h3>
                <p className="text-sm text-gray-600">Canjea tus sellos por recompensas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}