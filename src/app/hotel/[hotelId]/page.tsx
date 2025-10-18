'use client';

import { useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
// import HeroSection from '@/components/HeroSection/HeroSection';
import RoomDetails from '@/components/RoomDetails/RoomDetails';
import BookingSummary from '@/components/BookingSummary/BookingSummary';
import DatePicker from '@/components/DatePicker/DatePicker';
import GuestSelector from '@/components/GuestSelector/GuestSelector';
import { useCart } from '@/cart/cart';
import { DateRange } from 'react-day-picker';
import Image from 'next/image';

const hotelData = {
  'medellin': {
    name: 'Hotel Medellín',
    description: 'Ubicado en el corazón de la ciudad de la eterna primavera',
    image: '/hotel.jpg',
    location: 'Centro de Medellín'
  },
  'cali': {
    name: 'Hotel Cali',
    description: 'En la sucursal del cielo, con vista panorámica',
    image: '/hotel.jpg',
    location: 'Centro de Cali'
  },
  'bogota': {
    name: 'Hotel Bogotá',
    description: 'En la capital, cerca de los principales centros de convenciones',
    image: '/hotel.jpg',
    location: 'Centro de Bogotá'
  }
};

interface Room {
  id: number;
  adults: number;
  children: number;
  babies: number;
}

export default function HotelPage() {
  const params = useParams();
  const hotelId = params.hotelId as string;
  const [selectedRate, setSelectedRate] = useState('room-only');
  
  // Estados para los inputs
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(undefined);
  const [isGuestSelectorOpen, setIsGuestSelectorOpen] = useState(false);
  const [selectedRooms, setSelectedRooms] = useState<Room[]>([
    { id: 1, adults: 2, children: 0, babies: 0 }
  ]);
  const [hasValidDates, setHasValidDates] = useState(false);
  
  const dateButtonRef = useRef<HTMLButtonElement>(null);
  const guestButtonRef = useRef<HTMLDivElement>(null);
  
  // Protección de autenticación
  const { loading } = useAuthRedirect();
  const { setGuestConfigs, setPreConfiguredRooms } = useCart();

  const hotel = hotelData[hotelId as keyof typeof hotelData];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
  };

  // Calcular número de noches
  const calculateNights = () => {
    if (selectedRange?.from && selectedRange?.to) {
      const timeDiff = selectedRange.to.getTime() - selectedRange.from.getTime();
      const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
      return nights;
    }
    return 1; // Por defecto 1 noche
  };

  const handleDateSelect = (range: DateRange | undefined) => {
    setSelectedRange(range);
    
    // Validar que las fechas sean futuras
    if (range?.from && range?.to) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fechas
      
      const fromDate = new Date(range.from);
      fromDate.setHours(0, 0, 0, 0);
      
      const isValid = fromDate >= today;
      setHasValidDates(isValid);
    } else {
      setHasValidDates(false);
    }
  };

  const handleGuestSelect = (rooms: Room[]) => {
    setSelectedRooms(rooms);
    
    // Guardar las configuraciones de huéspedes en el carrito
    const configs = rooms.map(room => ({
      adults: room.adults,
      children: room.children,
      babies: room.babies
    }));
    setGuestConfigs(configs);
    
    // También guardar como habitaciones pre-configuradas
    setPreConfiguredRooms(configs);
  };

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

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Hotel no encontrado</h1>
          <p className="text-gray-600">El hotel que buscas no existe.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
      {/* Hotel Hero Section */}
      <section className="text-white py-20 relative min-h-[70vh] flex items-center overflow-hidden">
        {/* Imagen de fondo con gradiente */}
        <div className="absolute inset-0">
          <Image 
            src={hotel.image} 
            alt={hotel.name} 
            fill
            className="object-cover"
            priority
          />
        </div>
        
        {/* Overlay con gradiente */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60"></div>
        
        {/* Elementos decorativos */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-white/5 rounded-full animate-bounce"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-1000"></div>
        
        {/* Contenido */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              </svg>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
              {hotel.name}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-4 max-w-3xl mx-auto">
              {hotel.description}
            </p>
            <div className="flex items-center justify-center space-x-2 text-white/80">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-lg">{hotel.location}</span>
            </div>
          </div>
          
          {/* Inputs de búsqueda */}
          <div className="max-w-5xl mx-auto">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1 relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">📅 Seleccionar fechas</label>
                  <button
                    ref={dateButtonRef}
                    onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                    className="w-full flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md"
                  >
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-700 font-medium">{getDateDisplay()}</span>
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">👥 Habitaciones y huéspedes</label>
                  <div 
                    ref={guestButtonRef}
                    onClick={() => setIsGuestSelectorOpen(!isGuestSelectorOpen)}
                    className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 cursor-pointer transition-all duration-300 bg-white shadow-sm hover:shadow-md"
                  >
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-gray-700 font-medium">{getGuestDisplay()}</span>
                  </div>
                  
                  <GuestSelector
                    isOpen={isGuestSelectorOpen}
                    onClose={() => setIsGuestSelectorOpen(false)}
                    onGuestSelect={handleGuestSelect}
                    triggerRef={guestButtonRef}
                  />
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!hasValidDates ? (
          <div className="text-center py-16">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-12 max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                📅 Selecciona tus fechas
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Para ver las habitaciones disponibles, primero selecciona un intervalo de fechas válido (futuro).
              </p>
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <p className="text-sm text-gray-500 mb-2">💡 Tip:</p>
                <p className="text-sm text-gray-700">
                  Las fechas deben ser posteriores al día de hoy para poder mostrar las habitaciones disponibles.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  🏨 Habitaciones Disponibles
                </h2>
                <p className="text-lg text-gray-600">
                  Selecciona la habitación perfecta para tu estadía
                </p>
              </div>
              <RoomDetails 
                selectedRate={selectedRate} 
                onRateSelect={setSelectedRate} 
              />
            </div>
            <div className="lg:col-span-1">
              <BookingSummary 
                selectedRate={selectedRate} 
                selectedRange={selectedRange}
                nights={calculateNights()}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
