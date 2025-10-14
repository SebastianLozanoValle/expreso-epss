'use client';

import { useState, useEffect, useRef } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

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

  // Sync range with selectedRange prop
  useEffect(() => {
    setRange(selectedRange);
  }, [selectedRange]);

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

  console.log('DatePicker rendering with isOpen:', isOpen, 'position:', position);

  return (
    <div 
      ref={calendarRef}
      className="absolute z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4"
      style={{
        top: position.top,
        left: position.left,
        minWidth: '900px'
      }}
    >
      <DayPicker
        mode="range"
        selected={range}
        onSelect={setRange}
        numberOfMonths={3}
        className="rdp"
        showOutsideDays={true}
        fixedWeeks={true}
        fromDate={new Date(2025, 0, 1)}
        toDate={new Date(2029, 11, 31)}
        disabled={(date) => {
          const startDate = new Date(2025, 0, 1);
          const endDate = new Date(2029, 11, 31);
          return date < startDate || date > endDate;
        }}
      />

      <div className="flex justify-between mt-6">
        <button
          onClick={handleReset}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
        >
          Restablecer
        </button>
        <button
          onClick={handleDone}
          className="px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
        >
          Hecho
        </button>
      </div>
    </div>
  );
}
