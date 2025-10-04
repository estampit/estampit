'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

const enrollSchema = z.object({
  firstName: z.string().min(1, 'Nombre requerido'),
  lastName: z.string().min(1, 'Apellidos requeridos'),
  phone: z.string().min(1, 'Teléfono requerido'),
  email: z.string().email('Email inválido'),
  birthdate: z.string().min(1, 'Fecha de nacimiento requerida'),
})

type EnrollFormData = z.infer<typeof enrollSchema>

export default function EnrollForm() {
  const searchParams = useSearchParams()
  const storeCode = searchParams.get('s')

  const [isLoading, setIsLoading] = useState(false)
  const [passUrl, setPassUrl] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EnrollFormData>({
    resolver: zodResolver(enrollSchema),
  })

  useEffect(() => {
    if (!storeCode) {
      toast.error('Código de tienda no encontrado')
    }
  }, [storeCode])

  const onSubmit = async (data: EnrollFormData) => {
    if (!storeCode) {
      toast.error('Código de tienda requerido')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          storeCode,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al registrarse')
      }

      const result = await response.json()
      setPassUrl(result.passUrl)
      toast.success('¡Registro exitoso! Descarga tu tarjeta digital.')
    } catch (error) {
      console.error('Enrollment error:', error)
      toast.error(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  if (passUrl) {
    return (
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          ¡Tu tarjeta está lista!
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Haz clic en el botón para descargar y añadir a Apple Wallet
        </p>
        <a
          href={passUrl}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Descargar Tarjeta (.pkpass)
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
          Nombre
        </label>
        <input
          {...register('firstName')}
          type="text"
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.firstName && (
          <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
          Apellidos
        </label>
        <input
          {...register('lastName')}
          type="text"
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.lastName && (
          <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Teléfono
        </label>
        <input
          {...register('phone')}
          type="tel"
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          {...register('email')}
          type="email"
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700">
          Fecha de nacimiento
        </label>
        <input
          {...register('birthdate')}
          type="date"
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.birthdate && (
          <p className="mt-1 text-sm text-red-600">{errors.birthdate.message}</p>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading || !storeCode}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? 'Registrando...' : 'Obtener mi tarjeta'}
        </button>
      </div>
    </form>
  )
}