'use client';
import Link from 'next/link'
import{ ShoppingCartIcon } from '@heroicons/react/24/outline'
import { useCart } from '@/app/cart/cart'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation' 

export default function Header() {
  const [cartCount, setCartCount] = useState(0)
  const router = useRouter()
  const cart = useCart(s => s.rooms)

  useEffect(() => {
    setCartCount(cart.length)
  }, [cart])

  return (
    <header className="bg-teal-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold">Hotel Ilar 74</h1>
            <nav className="hidden md:flex space-x-6">
              <a href="#" className="text-teal-200 hover:text-white font-medium">Disponibilidad</a>
              <a href="#" className="text-white hover:text-teal-200">Información</a>
              <a href="#" className="text-white hover:text-teal-200">Contacto</a>
              <a href="#" className="text-white hover:text-teal-200">Normas</a>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm">COP | Español</span>
            
          </div>
        </div>
      </div>
    </header>
  );
}
