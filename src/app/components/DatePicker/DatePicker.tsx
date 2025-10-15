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
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRange(selectedRange);
  }, [selectedRange]);

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
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node) &&
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
