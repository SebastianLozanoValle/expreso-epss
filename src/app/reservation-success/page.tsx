'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth-store'

export default function ReservationSuccessPage() {
  const router = useRouter()
  const { user } = useAuthStore()

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Reserva confirmada!
          </h1>
          <p className="text-gray-600">
            Tu reserva ha sido procesada exitosamente. Recibirás un email de confirmación en breve.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">Detalles de la reserva</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Hotel Ilar 74</p>
            <p>Individual - Solo Habitación Tarifa Estándar</p>
            <p>mié, 22 oct 25 - sáb, 25 oct 25</p>
            <p>3 noches • 1 habitación • 1 huésped</p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.push('/')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            Volver al inicio
          </button>
          
          <button
            onClick={() => router.push('/booking')}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold transition-colors"
          >
            Hacer otra reserva
          </button>
        </div>

        {user && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Reserva realizada por: {user.email}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
