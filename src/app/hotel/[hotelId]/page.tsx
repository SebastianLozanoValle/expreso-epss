'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import HeroSection from '@/components/HeroSection/HeroSection';
import RoomDetails from '@/components/RoomDetails/RoomDetails';
import BookingSummary from '@/components/BookingSummary/BookingSummary';

const hotelData = {
  'saana-45': {
    name: 'Hotel Saana 45',
    description: 'Ubicado en el corazón de la ciudad',
    image: '🏨',
    location: 'Centro de la ciudad'
  },
  'boulevar-rio': {
    name: 'Hotel Boulevar del Rio',
    description: 'Vista panorámica al río',
    image: '🌊',
    location: 'Zona ribereña'
  },
  'ilar-corferias': {
    name: 'Hotel Ilar Corferias',
    description: 'Cerca del centro de convenciones',
    image: '🏢',
    location: 'Cerca de Corferias'
  }
};

export default function HotelPage() {
  const params = useParams();
  const hotelId = params.hotelId as string;
  const [selectedRate, setSelectedRate] = useState('room-only');
  
  // Protección de autenticación
  const { user, loading, isAuthenticated } = useAuthRedirect();

  const hotel = hotelData[hotelId as keyof typeof hotelData];

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
      <section className="bg-gradient-to-r from-teal-600 to-teal-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-6xl mb-4">{hotel.image}</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{hotel.name}</h1>
            <p className="text-xl text-teal-100 mb-2">{hotel.description}</p>
            <p className="text-lg text-teal-200">📍 {hotel.location}</p>
          </div>
        </div>
      </section>

      {/* Hero Section for booking */}
      <HeroSection />
      
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
