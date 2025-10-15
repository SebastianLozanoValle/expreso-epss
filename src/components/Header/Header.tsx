'use client';
import Link from 'next/link'
import{ ShoppingCartIcon, UserIcon } from '@heroicons/react/24/outline'
import { useCart } from '@/cart/cart'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/auth-store' 

export default function Header() {
  const [cartCount, setCartCount] = useState(0)
  const [selectedHotel, setSelectedHotel] = useState('')
  const router = useRouter()
  const pathname = usePathname()
  const cart = useCart(s => s.rooms)
  const { user, signOut } = useAuthStore()

  const hotels = [
    { id: 'saana-45', name: 'Hotel Saana 45', path: '/hotel/saana-45' },
    { id: 'boulevar-rio', name: 'Hotel Boulevar del Rio', path: '/hotel/boulevar-rio' },
    { id: 'ilar-corferias', name: 'Hotel Ilar Corferias', path: '/hotel/ilar-corferias' }
  ]

  useEffect(() => {
    setCartCount(cart.length)
  }, [cart])

  const handleHotelChange = (hotelId: string) => {
    if (hotelId === '') {
      setSelectedHotel('')
      return
    }
    const hotel = hotels.find(h => h.id === hotelId)
    if (hotel) {
      setSelectedHotel(hotel.name)
      router.push(hotel.path)
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <header className="bg-teal-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold">Expreso de Viajes</h1>
            <div className="hidden md:flex items-center space-x-4">
              <label className="text-sm text-teal-200">Hotel:</label>
              <select
                value={hotels.find(h => h.name === selectedHotel)?.id || ''}
                onChange={(e) => handleHotelChange(e.target.value)}
                className="bg-teal-700 text-white border border-teal-600 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Seleccionar</option>
                {hotels.map((hotel) => (
                  <option key={hotel.id} value={hotel.id}>
                    {hotel.name}
                  </option>
                ))}
              </select>
            </div>
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="text-teal-200 hover:text-white font-medium">Disponibilidad</Link>
              <Link href="/carga-masiva" className="text-teal-200 hover:text-white font-medium">Carga Masiva</Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm">COP | Español</span>
            
            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm flex items-center space-x-1"
              >
                <UserIcon className="h-4 w-4" />
                <span>Iniciar sesión</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
