'use client';

import { useState, useRef } from 'react';
import { DateRange } from 'react-day-picker';
import DatePicker from '@/app/components/DatePicker/DatePicker';
import GuestSelector from '@/app/components/GuestSelector/GuestSelector';

interface Room {
  id: number;
  adults: number;
  children: number;
  babies: number;
}

export default function HeroSection() {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(undefined);
  const [isGuestSelectorOpen, setIsGuestSelectorOpen] = useState(false);
  const [selectedRooms, setSelectedRooms] = useState<Room[]>([
    { id: 1, adults: 2, children: 0, babies: 0 },
    { id: 2, adults: 2, children: 0, babies: 0 },
    { id: 3, adults: 2, children: 0, babies: 0 },
    { id: 4, adults: 2, children: 0, babies: 0 }
  ]);
  const dateButtonRef = useRef<HTMLButtonElement>(null);
  const guestButtonRef = useRef<HTMLDivElement>(null);

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
  return (
    <section className="relative">
      <div className="h-96 bg-gradient-to-r from-green-800 to-green-900 relative overflow-hidden">
        {/* Hotel room background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-700 via-green-800 to-green-900">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        </div>
        
        {/* Booking Widget Overlay */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-4">
          <div className="bg-white rounded-lg shadow-xl p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar fechas</label>
                  <button
                    ref={dateButtonRef}
                    onClick={() => {
                      console.log('DatePicker button clicked, current state:', isDatePickerOpen);
                      setIsDatePickerOpen(!isDatePickerOpen);
                    }}
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
                <a href="#" className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span>Añadir código promocional</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
