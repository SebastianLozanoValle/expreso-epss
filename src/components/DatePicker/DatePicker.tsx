'use client';

import { useState, useEffect, useRef } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { createPortal } from 'react-dom';
import styles from './DatePicker.module.css';

interface DatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onDateSelect: (range: DateRange | undefined) => void;
  selectedRange?: DateRange;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
}

export default function DatePicker({ isOpen, onClose, onDateSelect, selectedRange, triggerRef }: DatePickerProps) {
  const [range, setRange] = useState<DateRange | undefined>(selectedRange);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const [isAvailable, setIsAvailable] = useState(true);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Simular fechas no disponibles (para demo)
  const unavailableDates = [
    new Date(2025, 9, 15), // 15 octubre
    new Date(2025, 9, 16), // 16 octubre
    new Date(2025, 9, 17), // 17 octubre
    new Date(2025, 9, 18), // 18 octubre
  ];

  // Sync range with selectedRange prop
  useEffect(() => {
    setRange(selectedRange);
  }, [selectedRange]);

  // Verificar disponibilidad cuando cambia el rango
  useEffect(() => {
    if (range?.from && range?.to) {
      const hasUnavailableDate = unavailableDates.some(date => 
        date >= range.from! && date <= range.to!
      );
      setIsAvailable(!hasUnavailableDate);
    } else {
      setIsAvailable(true);
    }
  }, [range, unavailableDates]);

  useEffect(() => {
    if (isOpen && triggerRef?.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: triggerRect.bottom + window.scrollY + 10,
        left: triggerRect.left + window.scrollX - 10, // centramos el popover
        width: triggerRect.width + 420 // ancho total acorde al diseño horizontal
      });
    }
  }, [isOpen, triggerRef]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node) && 
          triggerRef?.current && !triggerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose, triggerRef]);

  const handleDone = () => {
    onDateSelect(range);
    onClose();
  };

  const handleReset = () => {
    setRange(undefined);
    onDateSelect(undefined);
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={calendarRef}
      className="absolute z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 p-5"
      style={{
        top: position.top,
        left: position.left,
        minWidth: '720px'
      }}
    >
      {/* Pequeña flecha arriba */}
      <div
        className="absolute -top-2 left-10 w-4 h-4 bg-white border-l border-t border-gray-200 rotate-45"
      ></div>

      {/* Mensaje de disponibilidad */}
      {range?.from && range?.to && !isAvailable && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center">
          <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-blue-800 text-sm">
            El alojamiento no tiene disponibilidad durante las fechas indicadas. Pruebe a elegir otras.
          </span>
        </div>
      )}

      <DayPicker
        mode="range"
        selected={range}
        onSelect={setRange}
        numberOfMonths={3}
        className={`rdp text-black ${styles.rdp}`}
        showOutsideDays={true}
        fixedWeeks={true}
        fromDate={new Date(2025, 0, 1)}
        toDate={new Date(2029, 11, 31)}
        disabled={(date) => {
          const startDate = new Date(2025, 0, 1);
          const endDate = new Date(2029, 11, 31);
          return date < startDate || date > endDate;
        }}
        modifiers={{
          unavailable: unavailableDates,
        }}
        modifiersStyles={{
          unavailable: {
            backgroundColor: '#f3f4f6',
            color: '#9ca3af',
            textDecoration: 'line-through',
          }
        }}
        style={{
          color: '#000000',
          backgroundColor: '#ffffff',
          fontSize: '13px'
        }}
      />

      <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between items-center text-sm">
        <span className="text-gray-600">
          {range?.from && range?.to
            ? `Noches: ${
                (range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24)
              }`
            : ''}
        </span>
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-1 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-teal-500"
          >
            Restablecer
          </button>
          <button
            onClick={handleDone}
            className="px-4 py-1 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-teal-500"
          >
            Hecho
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
