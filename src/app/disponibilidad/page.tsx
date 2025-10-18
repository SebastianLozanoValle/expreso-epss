'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Room, RoomsData } from '@/types/room';
import RoomCard from '@/components/RoomCard/RoomCard';
import { useCart } from '@/cart/cart';

function DisponibilidadContent() {
  const [roomsData, setRoomsData] = useState<RoomsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    priceRange: { min: 0, max: 1000000 },
    capacity: { adults: 1, children: 0 },
    amenities: [] as string[]
  });
  
  const searchParams = useSearchParams();
  const { addRoom } = useCart();

  // Función para cargar datos desde el parámetro JSON
  const loadRoomsData = () => {
    try {
      const roomsParam = searchParams.get('rooms');
      if (roomsParam) {
        const parsedData = JSON.parse(decodeURIComponent(roomsParam));
        setRoomsData(parsedData);
      } else {
        // Datos de ejemplo si no hay parámetro
        setRoomsData(getSampleData());
      }
    } catch (err) {
      setError('Error al cargar los datos de las habitaciones');
      console.error('Error parsing rooms data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoomsData();
  }, [searchParams, loadRoomsData]);

  const handleAddToCart = (room: Room) => {
    addRoom({
      id: room.id,
      name: room.name,
      price: room.price,
      basePrice: room.price,
      capacity: room.capacity.adults
    });
  };

  const filteredRooms = roomsData?.rooms.filter(room => {
    const priceInRange = room.price >= filters.priceRange.min && room.price <= filters.priceRange.max;
    const capacityMatch = room.capacity.adults >= filters.capacity.adults && 
                         room.capacity.children >= filters.capacity.children;
    const amenitiesMatch = filters.amenities.length === 0 || 
                           filters.amenities.every(amenity => room.amenities.includes(amenity));
    
    return priceInRange && capacityMatch && amenitiesMatch;
  }) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando habitaciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg transition-all duration-300"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Disponibilidad de Habitaciones
          </h1>
          <p className="text-gray-600">
            {roomsData?.total || 0} habitaciones disponibles
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filtros */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
              
              {/* Rango de precios */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rango de precios
                </label>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Precio mínimo"
                    value={filters.priceRange.min}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      priceRange: { ...prev.priceRange, min: Number(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <input
                    type="number"
                    placeholder="Precio máximo"
                    value={filters.priceRange.max}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      priceRange: { ...prev.priceRange, max: Number(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Capacidad */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacidad
                </label>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Adultos"
                    value={filters.capacity.adults}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      capacity: { ...prev.capacity, adults: Number(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <input
                    type="number"
                    placeholder="Niños"
                    value={filters.capacity.children}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      capacity: { ...prev.capacity, children: Number(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Comodidades */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comodidades
                </label>
                <div className="space-y-2">
                  {['WiFi', 'Aire acondicionado', 'TV', 'Minibar', 'Balcón', 'Vista al mar'].map(amenity => (
                    <label key={amenity} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.amenities.includes(amenity)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters(prev => ({
                              ...prev,
                              amenities: [...prev.amenities, amenity]
                            }));
                          } else {
                            setFilters(prev => ({
                              ...prev,
                              amenities: prev.amenities.filter(a => a !== amenity)
                            }));
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Lista de habitaciones */}
          <div className="lg:col-span-3">
            {filteredRooms.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🏨</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No se encontraron habitaciones
                </h3>
                <p className="text-gray-600">
                  Intenta ajustar los filtros para ver más opciones
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredRooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    onAddToCart={() => handleAddToCart(room)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Función para obtener datos de ejemplo
function getSampleData(): RoomsData {
  return {
    rooms: [
      {
        id: 'room-1',
        name: 'Habitación',
        description: 'Habitación cómoda con todas las comodidades. Incluye: Traslado aeropuerto/terminal - hotel (ida y regreso), alojamiento por noche, 3 alimentaciones por día y traslado interno redondo (usuario y acompañantes)',
        price: 150000,
        currency: 'COP',
        image: '/images/room-1.jpg',
        capacity: { adults: 2, children: 2, babies: 0 },
        amenities: ['WiFi', 'Aire acondicionado', 'TV', 'Minibar'],
        size: '20m²',
        view: 'Vista a la ciudad',
        bedType: '1 cama doble',
        policies: {
          refundable: true,
          payLater: true,
          cancellationPolicy: 'Reembolsable hasta 24h antes'
        },
        availability: {
          available: true,
          checkIn: '2024-01-15',
          checkOut: '2024-01-16',
          nights: 1
        },
        rates: {
          soloUsuario: 133256,
          usuarioAcompañante: 199883,
          usuarioDosAcompañantes: 266511
        },
        hotel: {
          id: 'hotel-1',
          name: 'Hotel Medellín',
          location: 'Centro de Medellín'
        }
      },
      {
        id: 'room-2',
        name: 'Habitación',
        description: 'Habitación amplia con vista panorámica. Incluye: Traslado aeropuerto/terminal - hotel (ida y regreso), alojamiento por noche, 3 alimentaciones por día y traslado interno redondo (usuario y acompañantes)',
        price: 150000,
        currency: 'COP',
        image: '/images/room-2.jpg',
        capacity: { adults: 2, children: 2, babies: 0 },
        amenities: ['WiFi', 'Aire acondicionado', 'TV', 'Minibar', 'Balcón'],
        size: '20m²',
        view: 'Vista al río',
        bedType: '1 cama doble',
        policies: {
          refundable: true,
          payLater: true,
          cancellationPolicy: 'Reembolsable hasta 24h antes'
        },
        availability: {
          available: true,
          checkIn: '2024-01-15',
          checkOut: '2024-01-16',
          nights: 1
        },
        rates: {
          soloUsuario: 133256,
          usuarioAcompañante: 199883,
          usuarioDosAcompañantes: 266511
        },
        hotel: {
          id: 'hotel-2',
          name: 'Hotel Cali',
          location: 'Centro de Cali'
        }
      }
    ],
    total: 2
  };
}

export default function DisponibilidadPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <DisponibilidadContent />
    </Suspense>
  );
}
