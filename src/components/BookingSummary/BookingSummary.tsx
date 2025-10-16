'use client'
import { useState, useEffect } from 'react'
import { useCart } from '@/cart/cart'

interface BookingSummaryProps {
  selectedRate: string;
}

export default function BookingSummary({ selectedRate }: BookingSummaryProps) {
  const { rooms, subTotal, removeRoom, clearCart, removeRoomAndUpdateGuestSelector } = useCart()
  const [total, setTotal] = useState(0)
  const [isHydrated, setIsHydrated] = useState(false)
  const [isTaxesExpanded, setIsTaxesExpanded] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
    setTotal(subTotal())
  }, [subTotal])

  useEffect(() => {
    if (isHydrated) {
      setTotal(subTotal())
    }
  }, [rooms, subTotal, isHydrated])

  // Calcular IVA (19% del total)
  const ivaAmount = Math.round(total * 0.19)
  const subtotalAmount = total - ivaAmount
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900">{total.toLocaleString('es-CO')} COP Total</h3>
        {rooms.length > 0 && (
          <button
            onClick={clearCart}
            className="text-gray-400 hover:text-red-600 transition-colors p-2"
            title="Limpiar carrito"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
      
      <div className="space-y-4 mb-6">
        <div>
          <p className="text-sm text-gray-600">mar, 14 oct 25 - mié, 15 oct 25</p>
          <p className="text-sm text-gray-600">1 noche</p>
          <p className="text-sm text-gray-600">
            {rooms.length} habitación{rooms.length !== 1 ? 'es' : ''}, {
              rooms.reduce((total, room) => {
                const roomGuests = room.guestConfig 
                  ? room.guestConfig.adults + room.guestConfig.children + room.guestConfig.babies
                  : 2;
                return total + roomGuests;
              }, 0)
            } huésped{rooms.reduce((total, room) => {
              const roomGuests = room.guestConfig 
                ? room.guestConfig.adults + room.guestConfig.children + room.guestConfig.babies
                : 2;
              return total + roomGuests;
            }, 0) !== 1 ? 'es' : ''}
          </p>
        </div>
        
        {rooms.map((room) => {
          const totalGuests = room.guestConfig 
            ? room.guestConfig.adults + room.guestConfig.children + room.guestConfig.babies
            : 2; // Por defecto 2 huéspedes
          
          return (
            <div key={room.uniqueId} className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{room.name}</p>
                  <p className="text-sm text-gray-600">
                    {totalGuests} huésped{totalGuests !== 1 ? 'es' : ''} 1 noche
                  </p>
                  {room.guestConfig && (
                    <p className="text-xs text-gray-500">
                      {room.guestConfig.adults} adulto{room.guestConfig.adults !== 1 ? 's' : ''}
                      {room.guestConfig.children > 0 && `, ${room.guestConfig.children} niño${room.guestConfig.children !== 1 ? 's' : ''}`}
                      {room.guestConfig.babies > 0 && `, ${room.guestConfig.babies} bebé${room.guestConfig.babies !== 1 ? 's' : ''}`}
                    </p>
                  )}
                </div>
                <button 
                  onClick={() => removeRoomAndUpdateGuestSelector(room.uniqueId)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                  title="Eliminar habitación"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <p className="text-lg font-semibold text-gray-900 mt-2">
                {room.price.toLocaleString('es-CO')} COP
              </p>
            </div>
          );
        })}
      </div>

      <div className="border-t pt-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">Total</span>
          <span className="text-lg font-bold text-gray-900">{total.toLocaleString('es-CO')} COP</span>
        </div>
        <button 
          onClick={() => setIsTaxesExpanded(!isTaxesExpanded)}
          className="flex items-center text-sm text-gray-600 mt-2 border border-blue-500 rounded px-3 py-2 w-full justify-between hover:bg-blue-50 transition-colors"
        >
          <span>Impuestos y tarifas incluidos</span>
          <svg 
            className={`w-4 h-4 transition-transform ${isTaxesExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isTaxesExpanded && (
          <div className="mt-3 pl-4 border-l-2 border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">IVA</span>
              <span className="text-sm text-gray-700">{ivaAmount.toLocaleString('es-CO')} COP</span>
            </div>
          </div>
        )}
      </div>

      <div className="relative mb-6">
        {/* Triángulo apuntando hacia arriba */}
        <div className="absolute -top-2 right-8 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[8px] border-transparent border-b-cyan-100"></div>
        
        {/* Cuadro con color cyan claro */}
        <div className="bg-cyan-100 rounded-lg p-4 text-center">
          <p className="text-sm font-bold text-gray-900 mb-1">Reserve ahora, ¡pague después!</p>
          <p className="text-sm font-bold text-gray-900">Pago pendiente: {total.toLocaleString('es-CO')} COP</p>
        </div>
      </div>

      <button 
        onClick={() => window.location.href = '/booking'}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold text-lg"
      >
        Reservar
      </button>
    </div>
  );
}
