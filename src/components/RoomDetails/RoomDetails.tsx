'use client';
import { useState, useEffect } from 'react';
import { useCart } from '@/cart/cart';
import RoomInfoModal from '@/components/RoomInfoModal/RoomInfoModal';

interface RoomDetailsProps {
  selectedRate: string;
  onRateSelect: (rate: string) => void;
  selectedCity?: string;
}

export default function RoomDetails({ selectedRate, onRateSelect, selectedCity = 'Bogotá' }: RoomDetailsProps) {
  const { addRoomAutoLink } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalRoomType, setModalRoomType] = useState('');
  const [modalPrice, setModalPrice] = useState(0);
  const [modalRateType, setModalRateType] = useState('');

  // Función para obtener datos dinámicos basados en la ciudad
  const getRoomData = (city: string) => {
    let soloUsuario, usuarioAcompañante, acompañanteAdicional;
    
    switch (city) {
      case 'Bogotá':
        soloUsuario = 133256;
        usuarioAcompañante = 199883;
        acompañanteAdicional = 66628;
        break;
      case 'Medellín':
        soloUsuario = 163841;
        usuarioAcompañante = 245761;
        acompañanteAdicional = 81920;
        break;
      case 'Cali':
        soloUsuario = 182011;
        usuarioAcompañante = 273017;
        acompañanteAdicional = 91006;
        break;
      default:
        soloUsuario = 133256;
        usuarioAcompañante = 199883;
        acompañanteAdicional = 66628;
    }

    return {
      id: `habitacion-${city.toLowerCase()}`,
      name: `Habitación - Estándar`,
      image: 'Habitación',
      images: [`/${city === 'Bogotá' ? 'bogota' : city === 'Medellín' ? 'medellin' : 'cali'}.webp`],
      features: [
        'Traslado aeropuerto/terminal - hotel (ida y regreso)',
        'Alojamiento por noche',
        '3 alimentaciones por día',
        'Traslado interno redondo (usuario y acompañantes)'
      ],
      rates: [
        {
          id: 'solo-usuario',
          name: 'Solo Usuario',
          price: soloUsuario,
          description: 'Precio para 1 huésped - Incluye: Traslado aeropuerto/terminal, alojamiento, 3 alimentaciones, traslado interno'
        },
        {
          id: 'usuario-acompañante',
          name: 'Usuario + Acompañante',
          price: usuarioAcompañante,
          description: 'Precio para 2 huéspedes - Incluye: Traslado aeropuerto/terminal, alojamiento, 3 alimentaciones, traslado interno'
        },
        {
          id: 'usuario-dos-acompañantes',
          name: 'Usuario + 2 Acompañantes',
          price: usuarioAcompañante + acompañanteAdicional,
          description: 'Precio para 3 huéspedes - Incluye: Traslado aeropuerto/terminal, alojamiento, 3 alimentaciones, traslado interno'
        }
      ]
    };
  };

  const rooms = [getRoomData(selectedCity)];

  const handleAddToCart = (roomId: string, rateId: string) => {
    const room = rooms.find(r => r.id === roomId);
    const rate = room?.rates.find(r => r.id === rateId);
    if (room && rate) {
      // Determinar cantidad de huéspedes basándose en el tipo de plan
      let guests = 2; // Por defecto
      if (rateId === 'solo-usuario') {
        guests = 1;
      } else if (rateId === 'usuario-acompañante') {
        guests = 2;
      } else if (rateId === 'usuario-dos-acompañantes') {
        guests = 3;
      }
      
      // Crear configuración de huéspedes basada en el plan
      const guestConfig = {
        adults: guests,
        children: 0,
        babies: 0
      };
      
      addRoomAutoLink({
        id: `${roomId}-${rateId}`,
        name: `${room.name} - ${rate.name}`,
        price: rate.price,
        basePrice: rate.price,
        capacity: 4,
        guestConfig: guestConfig
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
               {/* Room Image */}
               <div className="md:w-80 flex-shrink-0">
                 <div className="relative w-full h-56 rounded-2xl overflow-hidden">
                   <img 
                     src={room.images[0]} 
                     alt={room.name}
                     className="w-full h-full object-cover"
                   />
                   <div className="absolute inset-0 bg-black/20"></div>
                 </div>
               </div>

              {/* Room Information */}
              <div className="flex-1">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">{room.name}</h2>
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
                        ? 'bg-gradient-to-r from-green-700 to-emerald-700 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md hover:shadow-lg'
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
