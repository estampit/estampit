import { Suspense } from 'react'
import EnrollForm from '@/components/EnrollForm'

export default function EnrollPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Únete al programa de fidelización
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Completa tus datos para obtener tu tarjeta digital
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Suspense fallback={<div>Cargando...</div>}>
            <EnrollForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}