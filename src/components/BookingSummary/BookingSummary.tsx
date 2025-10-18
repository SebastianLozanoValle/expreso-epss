'use client'
import { useState, useEffect } from 'react'
import { useCart } from '@/cart/cart'
import { DateRange } from 'react-day-picker'

interface BookingSummaryProps {
  selectedRate: string;
  selectedRange?: DateRange;
  nights: number;
}

export default function BookingSummary({ selectedRate, selectedRange, nights }: BookingSummaryProps) {
  const { rooms, subTotal, removeRoom, clearCart, removeRoomAndUpdateGuestSelector } = useCart()
  const [total, setTotal] = useState(0)
  const [isHydrated, setIsHydrated] = useState(false)
  const [isTaxesExpanded, setIsTaxesExpanded] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (isHydrated) {
      // Calcular total considerando el número de noches
      const baseTotal = subTotal()
      const totalWithNights = baseTotal * nights
      console.log('Debug - baseTotal:', baseTotal, 'nights:', nights, 'totalWithNights:', totalWithNights)
      setTotal(totalWithNights)
    }
  }, [rooms, subTotal, isHydrated, nights])

  // Calcular IVA (19% del total)
  const ivaAmount = Math.round(total * 0.19)
  const subtotalAmount = total - ivaAmount

  // Formatear fechas
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short',
      year: '2-digit'
    });
  };

  const getDateDisplay = () => {
    if (selectedRange?.from && selectedRange?.to) {
      return `${formatDate(selectedRange.from)} - ${formatDate(selectedRange.to)}`;
    }
    return 'mar, 14 oct 25 - mié, 15 oct 25'; // Fallback
  };
  
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sticky top-20 max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            {total.toLocaleString('es-CO')} COP
          </h3>
          <p className="text-sm text-gray-500 mt-1">Total</p>
        </div>
        {rooms.length > 0 && (
          <button
            onClick={clearCart}
            className="text-gray-400 hover:text-red-600 transition-all duration-300 p-3 rounded-full hover:bg-red-50"
            title="Limpiar carrito"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
      
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Fechas de estadía</h4>
            <p className="text-sm text-gray-600">{getDateDisplay()}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Huéspedes</h4>
            <p className="text-sm text-gray-600">
              {nights} noche{nights !== 1 ? 's' : ''} • {rooms.length} habitación{rooms.length !== 1 ? 'es' : ''} • {
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
        </div>
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
                    {totalGuests} huésped{totalGuests !== 1 ? 'es' : ''} {nights} noche{nights !== 1 ? 's' : ''}
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
                {(room.price * nights).toLocaleString('es-CO')} COP
              </p>
            </div>
          );
        })}

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
          <div className="mt-3 pl-4 border-l-2 border-gray-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Subtotal ({nights} noche{nights !== 1 ? 's' : ''})</span>
              <span className="text-sm text-gray-700">{(subTotal() * nights).toLocaleString('es-CO')} COP</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">IVA (19%)</span>
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
