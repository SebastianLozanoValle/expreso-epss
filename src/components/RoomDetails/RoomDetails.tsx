'use client';
import { useState } from 'react';
import { useCart } from '@/cart/cart';
import RoomInfoModal from '@/components/RoomInfoModal/RoomInfoModal';

interface RoomDetailsProps {
  selectedRate: string;
  onRateSelect: (rate: string) => void;
}

export default function RoomDetails({ selectedRate, onRateSelect }: RoomDetailsProps) {
  const { addRoom } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalRoomType, setModalRoomType] = useState('');
  const [modalPrice, setModalPrice] = useState(0);
  const [modalRateType, setModalRateType] = useState('');

  // Datos de las habitaciones - preparado para API
  const rooms = [
    {
      id: 'doble',
      name: 'Doble',
      image: 'Habitación Doble',
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
      addRoom({
        id: `${roomId}-${rateId}`,
        name: `${room.name} - ${rate.name}`,
        price: rate.price
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
        <div key={room.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Room Header */}
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Room Image */}
              <div className="md:w-64 flex-shrink-0">
                <div className="w-full h-48 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-orange-300 rounded-lg mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">{room.image}</p>
                  </div>
                </div>
              </div>

              {/* Room Information */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{room.name}</h2>
                
                <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
                  <span className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>{room.capacity}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    </svg>
                    <span>{room.bed}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                    </svg>
                    <span>{room.bathroom}</span>
                  </span>
                </div>

                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                  {room.features.map((feature, index) => (
                    <li key={index}>• {feature}</li>
                  ))}
                </ul>

                <a href="#" className="text-blue-600 hover:text-blue-800 text-sm">Menos información</a>
              </div>
            </div>
          </div>

          {/* Rate Options */}
          <div className="px-6 pb-6 space-y-4">
            {room.rates.map((rate) => (
              <div key={rate.id} className={`border rounded-lg p-4 ${selectedRate === rate.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{rate.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <span className="flex items-center space-x-1 text-green-600">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Reserve ahora, pague después</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>No reembolsable</span>
                      </span>
                    </div>
                    <button 
                      onClick={() => handleMoreInfo(room.id, rate.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm mb-2"
                    >
                      Más información
                    </button>
                    <div className="mt-2">
                      <span className="text-2xl font-bold text-gray-900">{rate.price.toLocaleString('es-CO')},00 COP</span>
                      <p className="text-sm text-gray-600">{rate.description}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleAddToCart(room.id, rate.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                  >
                    Seleccionar
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
