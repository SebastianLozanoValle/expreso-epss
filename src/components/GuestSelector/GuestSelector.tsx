'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

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
  ]);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const selectorRef = useRef<HTMLDivElement>(null);

  // Calcular posición del popover
  useEffect(() => {
    if (isOpen && triggerRef?.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: triggerRect.bottom + window.scrollY + 12, // un poco más abajo para espacio del triángulo
        left: triggerRect.left + window.scrollX - 16, // alineación centrada del triángulo
        width: triggerRect.width,
      });
    }
  }, [isOpen, triggerRef]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectorRef.current &&
        !selectorRef.current.contains(event.target as Node) &&
        triggerRef?.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose, triggerRef]);

  const updateRoom = (roomId: number, field: keyof Omit<Room, 'id'>, value: number) => {
    setRooms(prev =>
      prev.map(room => {
        if (room.id === roomId) {
          const newRoom = { ...room, [field]: Math.max(0, value) };
          
          // Validar capacidad máxima (4 huéspedes por defecto)
          const totalGuests = newRoom.adults + newRoom.children + newRoom.babies;
          const maxCapacity = 4; // Capacidad por defecto, se puede hacer dinámico
          
          if (totalGuests > maxCapacity) {
            // Si excede la capacidad, no actualizar
            return room;
          }
          
          return newRoom;
        }
        return room;
      })
    );
  };

  const addRoom = () => {
    const newId = Math.max(...rooms.map(r => r.id)) + 1;
    console.log('Agregando habitación:', { newId, currentRooms: rooms.length });
    setRooms(prev => {
      const newRooms = [...prev, { id: newId, adults: 2, children: 0, babies: 0 }];
      console.log('Nuevas habitaciones:', newRooms);
      return newRooms;
    });
  };

  const removeRoom = (roomId: number) => {
    if (rooms.length > 1) {
      setRooms(prev => prev.filter(r => r.id !== roomId));
    }
  };

  const handleConfirm = () => {
    onGuestSelect(rooms);
    onClose();
  };

  const getTotalGuests = () =>
    rooms.reduce((total, r) => total + r.adults + r.children + r.babies, 0);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={selectorRef}
      className="absolute z-[9999] bg-white rounded-xl shadow-xl border border-gray-200"
      style={{
        top: position.top,
        left: position.left,
        minWidth: '520px',
        maxHeight: '500px',
        overflowY: 'auto'
      }}
    >
      {/* Triángulo superior */}
      <div
        className="absolute top-[-10px] left-12 w-0 h-0 border-l-[10px] border-r-[10px] border-b-[10px] border-transparent border-b-white drop-shadow-md"
      ></div>

      <div className="p-4">
        {/* Header */}
        <div className="mb-4 border-b border-gray-100 pb-2">
          <h3 className="text-sm font-semibold text-gray-800">
            Seleccione las habitaciones y los huéspedes
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {rooms.length} habitación{rooms.length !== 1 && 'es'}, {getTotalGuests()} huésped
            {getTotalGuests() !== 1 && 'es'}
          </p>
        </div>

        {/* Habitaciones */}
        <div className="space-y-3 mb-4 max-h-[280px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 relative">
          {rooms.length > 3 && (
            <div className="absolute top-0 right-2 bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full z-10">
              {rooms.length} habitaciones
            </div>
          )}
          {rooms.map((room, index) => (
            <div
              key={room.id}
              className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    Habitación {index + 1}
                  </h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">
                      Capacidad: {room.adults + room.children + room.babies}/4
                    </span>
                    {(room.adults + room.children + room.babies) >= 4 && (
                      <span className="text-xs text-red-500 font-medium">
                        Máximo alcanzado
                      </span>
                    )}
                  </div>
                </div>
                {rooms.length > 1 && (
                  <button
                    onClick={() => removeRoom(room.id)}
                    className="text-gray-400 hover:text-red-500"
                    title="Eliminar habitación"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Adultos', sub: '13 o más', field: 'adults' },
                  { label: 'Niños', sub: '2 a 12 años', field: 'children' },
                  { label: 'Bebés', sub: 'Menos de 2 años', field: 'babies' },
                ].map((cat, i) => (
                  <div key={i}>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {cat.label}
                      <span className="block text-[10px] text-gray-400">
                        {cat.sub}
                      </span>
                    </label>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() =>
                          updateRoom(
                            room.id,
                            cat.field as keyof Omit<Room, 'id'>,
                            room[cat.field as keyof Omit<Room, 'id'>] - 1
                          )
                        }
                        className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        disabled={
                          (room[cat.field as keyof Omit<Room, 'id'>] as number) <=
                          (cat.field === 'adults' ? 1 : 0)
                        }
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 12H4"
                          />
                        </svg>
                      </button>
                      <input
                        type="number"
                        value={room[cat.field as keyof Omit<Room, 'id'>] as number}
                        onChange={(e) =>
                          updateRoom(
                            room.id,
                            cat.field as keyof Omit<Room, 'id'>,
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-8 text-center border border-gray-300 rounded text-xs py-1"
                        min="0"
                      />
                      <button
                        onClick={() =>
                          updateRoom(
                            room.id,
                            cat.field as keyof Omit<Room, 'id'>,
                            room[cat.field as keyof Omit<Room, 'id'>] + 1
                          )
                        }
                        disabled={(room.adults + room.children + room.babies) >= 4}
                        className={`w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 ${
                          (room.adults + room.children + room.babies) >= 4 
                            ? 'opacity-50 cursor-not-allowed' 
                            : ''
                        }`}
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v12m6-6H6"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-between border-t border-gray-100 pt-3">
          <button
            onClick={addRoom}
            className="px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
          >
            Añadir habitación
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}