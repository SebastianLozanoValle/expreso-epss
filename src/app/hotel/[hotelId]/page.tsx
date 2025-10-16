'use client';

import { useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import HeroSection from '@/components/HeroSection/HeroSection';
import RoomDetails from '@/components/RoomDetails/RoomDetails';
import BookingSummary from '@/components/BookingSummary/BookingSummary';
import DatePicker from '@/components/DatePicker/DatePicker';
import GuestSelector from '@/components/GuestSelector/GuestSelector';
import { useCart } from '@/cart/cart';
import { DateRange } from 'react-day-picker';
import Image from 'next/image';

const hotelData = {
  'saana-45': {
    name: 'Hotel Saana 45',
    description: 'Ubicado en el corazón de la ciudad',
    image: '/hotel.jpg',
    location: 'Centro de la ciudad'
  },
  'boulevar-rio': {
    name: 'Hotel Boulevar del Rio',
    description: 'Vista panorámica al río',
    image: '/hotel.jpg',
    location: 'Zona ribereña'
  },
  'ilar-corferias': {
    name: 'Hotel Ilar Corferias',
    description: 'Cerca del centro de convenciones',
    image: '/hotel.jpg',
    location: 'Cerca de Corferias'
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
  
  const dateButtonRef = useRef<HTMLButtonElement>(null);
  const guestButtonRef = useRef<HTMLDivElement>(null);
  
  // Protección de autenticación
  const { user, loading, isAuthenticated } = useAuthRedirect();
  const { setGuestConfigs, setPreConfiguredRooms } = useCart();

  const hotel = hotelData[hotelId as keyof typeof hotelData];

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
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
    <div className="min-h-screen bg-gray-50">
      {/* Hotel Hero Section */}
      <section className="text-white py-16 relative min-h-[60vh] flex items-center">
        {/* Imagen de fondo */}
        <div className="absolute inset-0">
          <Image 
            src={hotel.image} 
            alt={hotel.name} 
            fill
            className="object-cover"
            priority
          />
        </div>
        
        {/* Overlay negro transparente */}
        <div className="absolute inset-0 bg-black/30"></div>
        
        {/* Contenido */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{hotel.name}</h1>
            <p className="text-xl text-white/90 mb-2">{hotel.description}</p>
            <p className="text-lg text-white/80">📍 {hotel.location}</p>
          </div>
          
          {/* Inputs de búsqueda */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-xl p-6">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar fechas</label>
                  <button
                    ref={dateButtonRef}
                    onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
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
                  <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span>Añadir código promocional</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <RoomDetails 
              selectedRate={selectedRate} 
              onRateSelect={setSelectedRate} 
            />
          </div>
          <div className="lg:col-span-1">
            <BookingSummary selectedRate={selectedRate} />
          </div>
        </div>
      </main>
    </div>
  );
}
