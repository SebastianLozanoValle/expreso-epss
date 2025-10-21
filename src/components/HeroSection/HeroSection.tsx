'use client';

import { useState, useRef, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import DatePicker from '@/components/DatePicker/DatePicker';
import GuestSelector from '@/components/GuestSelector/GuestSelector';
import { useCart } from '@/cart/cart';

interface Room {
  id: number;
  adults: number;
  children: number;
  babies: number;
}

export default function HeroSection() {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(undefined);
  const [isGuestSelectorOpen, setIsGuestSelectorOpen] = useState(false);
  const [selectedRooms, setSelectedRooms] = useState<Room[]>([
    { id: 1, adults: 2, children: 0, babies: 0 }
  ]);
  const [isPromoCodeOpen, setIsPromoCodeOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const dateButtonRef = useRef<HTMLButtonElement>(null);
  const guestButtonRef = useRef<HTMLDivElement>(null);
  const { setGuestConfigs, setPreConfiguredRooms, rooms: cartRooms, getLinkedRoomsCount, getPreConfiguredRoomsCount } = useCart();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const handleDateSelect = (range: DateRange | undefined) => {
    setSelectedRange(range);
  };

  const handleGuestSelect = (rooms: Room[]) => {
    setSelectedRooms(rooms);
    
    // Guardar las configuraciones de huéspedes en el carrito incluyendo fechas
    const configs = rooms.map(room => ({
      adults: room.adults,
      children: room.children,
      babies: room.babies,
      checkIn: selectedRange?.from?.toISOString().split('T')[0], // Formato YYYY-MM-DD
      checkOut: selectedRange?.to?.toISOString().split('T')[0] // Formato YYYY-MM-DD
    }));
    setGuestConfigs(configs);
    
    // También guardar como habitaciones pre-configuradas
    setPreConfiguredRooms(configs);
  };

  // Sincronizar GuestSelector con el carrito
  useEffect(() => {
    const linkedRoomsCount = getLinkedRoomsCount();
    const preConfiguredCount = getPreConfiguredRoomsCount();
    
    console.log('Sincronización:', {
      linkedRoomsCount,
      preConfiguredCount,
      selectedRoomsLength: selectedRooms.length,
      cartRooms: cartRooms.map(r => ({ id: r.id, hasConfig: !!r.guestConfig }))
    });
    
    // Si hay habitaciones en el carrito, actualizar el GuestSelector para que coincida
    if (linkedRoomsCount > 0 && linkedRoomsCount !== selectedRooms.length) {
      console.log('Actualizando GuestSelector de', selectedRooms.length, 'a', linkedRoomsCount, 'habitaciones');
      
      const newRooms = [];
      for (let i = 1; i <= linkedRoomsCount; i++) {
        if (i <= selectedRooms.length) {
          // Mantener la configuración existente
          newRooms.push(selectedRooms[i - 1]);
        } else {
          // Agregar nueva habitación con configuración por defecto
          newRooms.push({ id: i, adults: 2, children: 0, babies: 0 });
        }
      }
      setSelectedRooms(newRooms);
    }
  }, [cartRooms, getLinkedRoomsCount, selectedRooms.length]);

  const getDateDisplay = () => {
    if (selectedRange?.from && selectedRange?.to) {
      return `${formatDate(selectedRange.from)} → ${formatDate(selectedRange.to)}`;
    }
    return 'Seleccionar fechas';
  };

  const getGuestDisplay = () => {
    const totalGuests = selectedRooms.reduce((total, room) => total + room.adults + room.children + room.babies, 0);
    return `${selectedRooms.length} habitación${selectedRooms.length !== 1 ? 'es' : ''}, ${totalGuests} huésped${totalGuests !== 1 ? 'es' : ''}`;
  };

  const handlePromoCodeToggle = () => {
    setIsPromoCodeOpen(!isPromoCodeOpen);
    if (isPromoCodeOpen) {
      // Si se cierra, limpiar el código y mensaje
      setPromoCode('');
      setPromoMessage('');
      setPromoApplied(false);
    }
  };

  const handlePromoCodeSearch = () => {
    // Códigos promocionales válidos (simulados)
    const validPromoCodes = ['DESCUENTO10', 'WELCOME20', 'HOTEL2025', 'ILAR74'];
    
    if (validPromoCodes.includes(promoCode.toUpperCase())) {
      setPromoMessage('¡Código promocional aplicado correctamente!');
      setPromoApplied(true);
    } else {
      setPromoMessage('El código promocional no existe o no es válido.');
      setPromoApplied(false);
    }
  };

  const handlePromoCodeClear = () => {
    setPromoCode('');
    setPromoMessage('');
    setPromoApplied(false);
  };
  return (
    <section className="relative">
      <div className="h-96 bg-gradient-to-r from-green-800 to-green-900 relative">
        {/* Hotel room background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-700 via-green-800 to-green-900">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        </div>
        
        {/* Booking Widget Overlay */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-4">
          <div className="bg-white rounded-lg shadow-xl p-6">
            {/* Sección Principal */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar fechas</label>
                  <button
                    ref={dateButtonRef}
                    onClick={() => {
                      console.log('DatePicker button clicked, current state:', isDatePickerOpen);
                      setIsDatePickerOpen(!isDatePickerOpen);
                    }}
                    className="w-full flex items-center space-x-2 p-3 border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-700">{getDateDisplay()}</span>
                  </button>
                  
                  <DatePicker
                    isOpen={isDatePickerOpen}
                    onClose={() => setIsDatePickerOpen(false)}
                    onDateSelect={handleDateSelect}
                    selectedRange={selectedRange}
                    triggerRef={dateButtonRef}
                  />
                </div>
              
              <div className="flex-1 relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Seleccione las habitaciones y los huéspedes</label>
                <div 
                  ref={guestButtonRef}
                  onClick={() => setIsGuestSelectorOpen(!isGuestSelectorOpen)}
                  className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent cursor-pointer"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-gray-700">{getGuestDisplay()}</span>
                </div>
                
                <GuestSelector
                  isOpen={isGuestSelectorOpen}
                  onClose={() => setIsGuestSelectorOpen(false)}
                  onGuestSelect={handleGuestSelect}
                  triggerRef={guestButtonRef}
                />
              </div>
              
              <div className="flex items-center">
                <button 
                  onClick={handlePromoCodeToggle}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span>{isPromoCodeOpen ? 'Ocultar código promocional' : 'Añadir código promocional'}</span>
                </button>
              </div>
            </div>

            {/* Separador */}
            {isPromoCodeOpen && (
              <div className="border-t border-gray-200 mt-4 pt-4">
                {/* Sección de Código Promocional */}
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Introduzca un código promocional"
                    className={`flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black ${
                      promoMessage && !promoApplied 
                        ? 'border-red-500' 
                        : promoMessage && promoApplied 
                        ? 'border-green-500' 
                        : 'border-gray-300'
                    }`}
                  />
                  <button
                    onClick={handlePromoCodeSearch}
                    className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-black"
                  >
                    Buscar
                  </button>
                  <button
                    onClick={handlePromoCodeClear}
                    className="px-4 py-3 text-black hover:text-gray-600 focus:outline-none transition-colors"
                  >
                    Borrar
                  </button>
                </div>
                {promoMessage && (
                  <div className={`mt-2 text-sm ${
                    promoApplied ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {promoMessage}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
