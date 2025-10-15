'use client';

import { useState } from 'react';
import { Room } from '@/types/room';

interface RoomCardProps {
  room: Room;
  onAddToCart: () => void;
}

export default function RoomCard({ room, onAddToCart }: RoomCardProps) {
  const [selectedRate, setSelectedRate] = useState<'roomOnly' | 'breakfast' | 'allInclusive'>('roomOnly');
  const [showDetails, setShowDetails] = useState(false);

  const getCurrentPrice = () => {
    switch (selectedRate) {
      case 'breakfast':
        return room.rates.breakfast;
      case 'allInclusive':
        return room.rates.allInclusive;
      default:
        return room.rates.roomOnly;
    }
  };

  const getRateLabel = () => {
    switch (selectedRate) {
      case 'breakfast':
        return 'Con desayuno';
      case 'allInclusive':
        return 'Todo incluido';
      default:
        return 'Solo habitación';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Imagen */}
        <div className="md:w-1/3 h-48 md:h-auto relative">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
            <div className="text-white text-6xl">🏨</div>
          </div>
          <div className="absolute top-4 right-4">
            {room.policies.payLater && (
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                Pague después
              </span>
            )}
          </div>
        </div>

        {/* Contenido */}
        <div className="md:w-2/3 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {room.name}
              </h3>
              <p className="text-gray-600 text-sm mb-2">{room.description}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>👥 {room.capacity.adults} adultos, {room.capacity.children} niños</span>
                <span>🛏️ {room.bedType}</span>
                <span>📏 {room.size}</span>
                <span>👁️ {room.view}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {getCurrentPrice().toLocaleString('es-CO')} {room.currency}
              </div>
              <div className="text-sm text-gray-500">{getRateLabel()}</div>
            </div>
          </div>

          {/* Comodidades */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {room.amenities.slice(0, 4).map((amenity, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                >
                  {amenity}
                </span>
              ))}
              {room.amenities.length > 4 && (
                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                  +{room.amenities.length - 4} más
                </span>
              )}
            </div>
          </div>

          {/* Políticas */}
          <div className="mb-4 flex items-center space-x-4 text-sm">
            {room.policies.payLater && (
              <div className="flex items-center text-green-600">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Reserve ahora, pague después
              </div>
            )}
            <div className="flex items-center text-gray-500">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {room.policies.cancellationPolicy}
            </div>
          </div>

          {/* Tarifas */}
          <div className="mb-4">
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedRate('roomOnly')}
                className={`px-3 py-1 text-sm rounded ${
                  selectedRate === 'roomOnly'
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Solo habitación
              </button>
              <button
                onClick={() => setSelectedRate('breakfast')}
                className={`px-3 py-1 text-sm rounded ${
                  selectedRate === 'breakfast'
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Con desayuno
              </button>
              <button
                onClick={() => setSelectedRate('allInclusive')}
                className={`px-3 py-1 text-sm rounded ${
                  selectedRate === 'allInclusive'
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todo incluido
              </button>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-teal-600 hover:text-teal-700 text-sm font-medium"
            >
              {showDetails ? 'Ocultar detalles' : 'Ver más detalles'}
            </button>
            <button
              onClick={onAddToCart}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Agregar al carrito
            </button>
          </div>

          {/* Detalles expandibles */}
          {showDetails && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Comodidades</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {room.amenities.map((amenity, index) => (
                      <li key={index} className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {amenity}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Información</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Hotel:</strong> {room.hotel.name}</p>
                    <p><strong>Ubicación:</strong> {room.hotel.location}</p>
                    <p><strong>Tamaño:</strong> {room.size}</p>
                    <p><strong>Vista:</strong> {room.view}</p>
                    <p><strong>Cama:</strong> {room.bedType}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
