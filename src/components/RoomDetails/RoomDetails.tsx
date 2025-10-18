'use client';
import { useState, useEffect } from 'react';
import { useCart } from '@/cart/cart';
import RoomInfoModal from '@/components/RoomInfoModal/RoomInfoModal';

interface RoomDetailsProps {
  selectedRate: string;
  onRateSelect: (rate: string) => void;
}

export default function RoomDetails({ selectedRate, onRateSelect }: RoomDetailsProps) {
  const { addRoomAutoLink } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalRoomType, setModalRoomType] = useState('');
  const [modalPrice, setModalPrice] = useState(0);
  const [modalRateType, setModalRateType] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Resetear índice de imagen cuando cambie la habitación
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedRate]);

  // Datos de las habitaciones - preparado para API
  const rooms = [
    {
      id: 'doble',
      name: 'Doble',
      image: 'Habitación Doble',
      images: [
        '/hotel.jpg',
        '/hotel.jpg',
        '/hotel.jpg',
        '/hotel.jpg'
      ],
      capacity: 'Capacidad para 4',
      bed: '1 cama individual',
      bathroom: '1 baño',
      features: [
        'Vista a la ciudad',
        'Sillas de comedor',
        'Armarios en la habitación',
        'Microondas',
        'Secador de pelo',
        'Escritorio',
        'Ropa de cama y toallas',
        'Artículos de aseo gratuitos'
      ],
      rates: [
        {
          id: 'room-only',
          name: 'Solo Habitación Tarifa Estándar',
          price: 182000,
          description: 'Precio para 1 noche, 2 huéspedes'
        },
        {
          id: 'breakfast',
          name: 'Desayuno Incluido Tarifa Estándar',
          price: 202000,
          description: 'Precio para 1 noche, 2 huéspedes'
        }
      ]
    },
    {
      id: 'suite',
      name: 'Suite',
      image: 'Habitación Suite',
      capacity: 'Capacidad para 4',
      bed: '1 cama doble',
      bathroom: '1 baño',
      features: [
        '25m²',
        'Vista a la ciudad',
        'TV',
        'Microondas',
        'Sillas de comedor',
        'Artículos de aseo gratuitos',
        'Ropa de cama y toallas',
        'Secador de pelo'
      ],
      rates: [
        {
          id: 'suite-room-only',
          name: 'Solo Habitación Tarifa Estándar',
          price: 204000,
          description: 'Precio para 1 noche, 2 huéspedes'
        },
        {
          id: 'suite-breakfast',
          name: 'Desayuno Incluido Tarifa Estándar',
          price: 224000,
          description: 'Precio para 1 noche, 2 huéspedes'
        }
      ]
    }
  ];

  const handleAddToCart = (roomId: string, rateId: string) => {
    const room = rooms.find(r => r.id === roomId);
    const rate = room?.rates.find(r => r.id === rateId);
    if (room && rate) {
      // Extraer capacidad del texto (ej: "Capacidad para 4" -> 4)
      const capacityMatch = room.capacity.match(/\d+/);
      const capacity = capacityMatch ? parseInt(capacityMatch[0]) : 4;
      
      addRoomAutoLink({
        id: `${roomId}-${rateId}`,
        name: `${room.name} - ${rate.name}`,
        price: rate.price,
        basePrice: rate.price, // Precio base por 2 huéspedes
        capacity: capacity
      });
      onRateSelect(rateId);
    }
  };

  const handleMoreInfo = (roomId: string, rateId: string) => {
    const room = rooms.find(r => r.id === roomId);
    const rate = room?.rates.find(r => r.id === rateId);
    if (room && rate) {
      setModalRoomType(room.name);
      setModalPrice(rate.price);
      setModalRateType(rate.name);
      setIsModalOpen(true);
    }
  };

  const handleModalSelect = () => {
    // Esta función se actualizará dinámicamente según el modal abierto
    const roomId = modalRoomType.toLowerCase();
    const rateId = modalPrice === 182000 ? 'room-only' : 
                   modalPrice === 202000 ? 'breakfast' :
                   modalPrice === 204000 ? 'suite-room-only' : 'suite-breakfast';
    handleAddToCart(roomId, rateId);
  };

  return (
    <div className="space-y-8">
      {rooms.map((room) => (
        <div key={room.id} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 overflow-hidden transition-all duration-500 transform hover:-translate-y-2">
          {/* Room Header */}
          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Room Image Carousel */}
              <div className="md:w-80 flex-shrink-0">
                <div className="relative w-full h-56 rounded-2xl overflow-hidden">
                  <img 
                    src={room.images?.[currentImageIndex] || '/hotel.jpg'} 
                    alt={room.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20"></div>
                  
                  {/* Navigation arrows */}
                  {room.images && room.images.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImageIndex(prev => prev === 0 ? (room.images?.length || 1) - 1 : prev - 1)}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-colors"
                      >
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setCurrentImageIndex(prev => prev === (room.images?.length || 1) - 1 ? 0 : prev + 1)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-colors"
                      >
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}
                  
                  {/* Image indicators */}
                  {room.images && room.images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {room.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Room Information */}
              <div className="flex-1">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">{room.name}</h2>
                </div>
                
                <div className="flex items-center space-x-6 mb-6 text-sm">
                  <span className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-full">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-green-700 font-medium">{room.capacity}</span>
                  </span>
                  <span className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-full">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    </svg>
                    <span className="text-green-700 font-medium">{room.bed}</span>
                  </span>
                  <span className="flex items-center space-x-2 bg-purple-50 px-3 py-2 rounded-full">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                    </svg>
                    <span className="text-purple-700 font-medium">{room.bathroom}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  {room.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline transition-colors">
                  Ver menos información
                </button>
              </div>
            </div>
          </div>

          {/* Rate Options */}
          <div className="px-8 pb-8 space-y-6">
            {room.rates.map((rate) => (
              <div key={rate.id} className={`border-2 rounded-2xl p-6 transition-all duration-300 ${
                selectedRate === rate.id 
                  ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      <h3 className="text-xl font-bold text-gray-900">{rate.name}</h3>
                      {selectedRate === rate.id && (
                        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          ✓ Seleccionado
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-6 text-sm mb-4">
                      <span className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-full">
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-green-700 font-medium">Reserve ahora, pague después</span>
                      </span>
                      <span className="flex items-center space-x-2 bg-orange-50 px-3 py-2 rounded-full">
                        <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-orange-700 font-medium">No reembolsable</span>
                      </span>
                    </div>
                    <button 
                      onClick={() => handleMoreInfo(room.id, rate.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline transition-colors mb-4"
                    >
                      Ver más información
                    </button>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-gray-900">{rate.price.toLocaleString('es-CO')},00 COP</span>
                      <p className="text-sm text-gray-600 mt-1">{rate.description}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleAddToCart(room.id, rate.id)}
                    className={`px-8 py-3 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
                      selectedRate === rate.id
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg'
                    }`}
                  >
                    {selectedRate === rate.id ? '✓ Seleccionado' : 'Seleccionar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <RoomInfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        roomType={modalRoomType}
        price={modalPrice}
        rateType={modalRateType}
        onSelect={handleModalSelect}
      />
    </div>
  );
}
