'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth-store'
import Link from 'next/link'
import Image from 'next/image'

export default function Header() {
  const [selectedHotel, setSelectedHotel] = useState('')
  const router = useRouter()
  const { user, signOut } = useAuthStore()

  const hotels = [
    { id: 'medellin', name: 'Hotel Medellín' },
    { id: 'cali', name: 'Hotel Cali' },
    { id: 'bogota', name: 'Hotel Bogotá' }
  ]

  const handleHotelChange = (hotelId: string) => {
    setSelectedHotel(hotelId)
    if (hotelId) {
      router.push(`/hotel/${hotelId}`)
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900 flex gap-2 items-center">
              <div className="h-14 w-auto">
                <Image 
                  src="/hebrara.png" 
                  alt="Logo Hebrara" 
                  width={0}
                  height={0}
                  sizes="100vw"
                  className="h-full w-auto object-contain"
                />
              </div>
              <div className="h-14 w-auto">
                <Image 
                  src="/expreso-viajes-y-turismo.jpg" 
                  alt="Logo Expreso Viajes" 
                  width={0}
                  height={0}
                  sizes="100vw"
                  className="h-full w-auto object-contain"
                />
              </div>
            </Link>
          </div>

          {/* Hotel Selector */}
          <div className="relative">
              <select
                value={selectedHotel}
                onChange={(e) => handleHotelChange(e.target.value)}
                className="appearance-none bg-white border-2 border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-400 transition-colors min-w-[180px]"
              >
                <option value="">Seleccionar Hotel</option>
                {hotels.map((hotel) => (
                  <option key={hotel.id} value={hotel.id}>
                    {hotel.name}
                  </option>
                ))}
              </select>
              {/* Custom dropdown arrow */}
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-6">
            <button
              onClick={() => router.push('/')}
              className="text-gray-700 hover:text-teal-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Inicio
            </button>
            
            <button
              onClick={() => router.push('/reservas')}
              className="text-gray-700 hover:text-teal-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Reservas
            </button>
            
            <button
              onClick={() => router.push('/carga-masiva')}
              className="text-gray-700 hover:text-teal-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Carga Masiva
            </button>

            <button
              onClick={() => router.push('/famisanar')}
              className="text-gray-700 hover:text-teal-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Famisanar
            </button>
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            

            {/* Auth Section */}
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 font-medium">
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <button
                onClick={() => router.push('/auth/login')}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 shadow-sm"
              >
                Iniciar Sesión
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}