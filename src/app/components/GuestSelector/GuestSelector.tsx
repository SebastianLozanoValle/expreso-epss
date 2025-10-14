'use client';

import { useState, useRef, useEffect } from 'react';

interface GuestSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onGuestSelect: (rooms: Room[]) => void;
  triggerRef?: React.RefObject<HTMLDivElement | null>;
}

interface Room {
  id: number;
  adults: number;
  children: number;
  babies: number;
}

export default function GuestSelector({ isOpen, onClose, onGuestSelect, triggerRef }: GuestSelectorProps) {
  const [rooms, setRooms] = useState<Room[]>([
    { id: 1, adults: 2, children: 0, babies: 0 },
    { id: 2, adults: 2, children: 0, babies: 0 },
    { id: 3, adults: 2, children: 0, babies: 0 },
    { id: 4, adults: 2, children: 0, babies: 0 }
  ]);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const selectorRef = useRef<HTMLDivElement>(null);

  // Calcular posición del selector
  useEffect(() => {
    if (isOpen && triggerRef?.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: triggerRect.bottom + window.scrollY + 8,
        left: triggerRect.left + window.scrollX,
        width: triggerRect.width
      });
    }
  }, [isOpen, triggerRef]);

  // Manejar clicks fuera del selector
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node) && 
          triggerRef?.current && !triggerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose, triggerRef]);

  const updateRoom = (roomId: number, field: keyof Omit<Room, 'id'>, value: number) => {
    setRooms(prev => prev.map(room => 
      room.id === roomId ? { ...room, [field]: Math.max(0, value) } : room
    ));
  };

  const addRoom = () => {
    const newId = Math.max(...rooms.map(r => r.id)) + 1;
    setRooms(prev => [...prev, { id: newId, adults: 2, children: 0, babies: 0 }]);
  };

  const removeRoom = (roomId: number) => {
    if (rooms.length > 1) {
      setRooms(prev => prev.filter(room => room.id !== roomId));
    }
  };

  const handleConfirm = () => {
    onGuestSelect(rooms);
    onClose();
  };

  const getTotalGuests = () => {
    return rooms.reduce((total, room) => total + room.adults + room.children + room.babies, 0);
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={selectorRef}
      className="absolute z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-6"
      style={{
        top: position.top,
        left: position.left,
        minWidth: '600px',
        maxWidth: '600px'
      }}
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Seleccione las habitaciones y los huéspedes
        </h3>
        <p className="text-sm text-gray-600">
          {rooms.length} habitación{rooms.length !== 1 ? 'es' : ''}, {getTotalGuests()} huésped{getTotalGuests() !== 1 ? 'es' : ''}
        </p>
      </div>

      {/* Rooms Configuration */}
      <div className="space-y-4 mb-6">
        {rooms.map((room, index) => (
          <div key={room.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">Habitación {index + 1}</h4>
              {rooms.length > 1 && (
                <button
                  onClick={() => removeRoom(room.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                  title="Eliminar habitación"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Adultos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adultos (13 o más)
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateRoom(room.id, 'adults', room.adults - 1)}
                    disabled={room.adults <= 1}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <input
                    type="number"
                    value={room.adults}
                    onChange={(e) => updateRoom(room.id, 'adults', parseInt(e.target.value) || 1)}
                    className="w-12 text-center border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                  />
                  <button
                    onClick={() => updateRoom(room.id, 'adults', room.adults + 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Niños */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Niños (Entre 2 y 12 años)
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateRoom(room.id, 'children', room.children - 1)}
                    disabled={room.children <= 0}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <input
                    type="number"
                    value={room.children}
                    onChange={(e) => updateRoom(room.id, 'children', parseInt(e.target.value) || 0)}
                    className="w-12 text-center border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                  <button
                    onClick={() => updateRoom(room.id, 'children', room.children + 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Bebés */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bebés (Menos de 2 años)
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateRoom(room.id, 'babies', room.babies - 1)}
                    disabled={room.babies <= 0}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <input
                    type="number"
                    value={room.babies}
                    onChange={(e) => updateRoom(room.id, 'babies', parseInt(e.target.value) || 0)}
                    className="w-12 text-center border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                  <button
                    onClick={() => updateRoom(room.id, 'babies', room.babies + 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button
          onClick={addRoom}
          className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Añadir habitación
        </button>
        <button
          onClick={handleConfirm}
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Confirmar
        </button>
      </div>
    </div>
  );
}
