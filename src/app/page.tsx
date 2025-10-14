'use client';

import { useState } from 'react';
import HeroSection from '@/app/components/HeroSection/HeroSection';
import RoomDetails from '@/app/components/RoomDetails/RoomDetails';
import BookingSummary from '@/app/components/BookingSummary/BookingSummary';

export default function Home() {
  const [selectedRate, setSelectedRate] = useState('room-only');

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <RoomDetails 
              selectedRate={selectedRate} 
              onRateSelect={setSelectedRate} 
            />
          </div>
          <div className="lg:col-span-1">
            <BookingSummary selectedRate={selectedRate} />
          </div>
        </div>
      </main>
    </div>
  );
}
