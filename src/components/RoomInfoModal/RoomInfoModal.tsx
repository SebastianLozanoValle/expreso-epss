'use client';

import { useEffect } from 'react';

interface RoomInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomType: string;
  price: number;
  rateType: string;
  onSelect: () => void;
}

export default function RoomInfoModal({ isOpen, onClose, roomType, price, rateType, onSelect }: RoomInfoModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = () => {
    onSelect();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{roomType} - {rateType}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Layout: Left content, Right image */}
          <div className="flex gap-8">
            {/* Left Content */}
            <div className="flex-1">

              {/* Booking Conditions */}
              <div className="flex items-center space-x-4 mb-6 text-sm">
                <span className="flex items-center space-x-1 text-green-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Reserve ahora, pague después</span>
                </span>
                <span className="flex items-center space-x-1 text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>No reembolsable</span>
                </span>
              </div>

              {/* Cancellation Policy */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Política de cancelación del alojamiento</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  La cancelación es gratuita 7 días antes de la fecha de llegada, después de este tiempo le cobraremos el 100% del precio de la habitación como cargo por cancelación.
                </p>
              </div>

              {/* Room Characteristics */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Características de la habitación</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-gray-600">Ocupación máxima</span>
                    <span className="font-medium text-gray-900">Capacidad Para 4</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    </svg>
                    <span className="text-gray-600">Configuración de las camas</span>
                    <span className="font-medium text-gray-900">1 Cama Individual</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                    </svg>
                    <span className="text-gray-600">Número de baños</span>
                    <span className="font-medium text-gray-900">1</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="text-gray-600">Vistas de la habitación</span>
                    <span className="font-medium text-gray-900">Vista A La Ciudad</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                    </svg>
                    <span className="text-gray-600">Política para fumadores</span>
                    <span className="font-medium text-gray-900">No Fumadores</span>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Servicios</h3>
                <div className="text-sm text-gray-600">
                  <p>Sillas de comedor, Armarios en la habitación, Microondas, Secador de pelo, Escritorio, Ropa de cama y toallas, Artículos de aseo gratuitos</p>
                </div>
              </div>
            </div>

            {/* Right Content - Image and Rate Breakdown */}
            <div className="w-80 flex-shrink-0">
              {/* Room Image */}
              <div className="mb-6">
                <div className="w-full h-48 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-orange-300 rounded-lg mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Habitación</p>
                  </div>
                </div>
              </div>

              {/* Rate Breakdown */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Desglose de la tarifa</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">mar, 14 oct:</span>
                    <span className="font-medium text-gray-900">{price.toLocaleString('es-CO')} COP</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-2">
                    <span className="font-semibold text-gray-900">Total por 1 noche:</span>
                    <span className="font-semibold text-gray-900">{price.toLocaleString('es-CO')} COP</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="text-center mt-6">
            <div className="mb-4">
              <span className="text-2xl font-bold text-gray-900">{price.toLocaleString('es-CO')} COP</span>
            </div>
            <button 
              onClick={handleSelect}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold text-lg mb-2"
            >
              Seleccionar
            </button>
            <p className="text-sm text-gray-600">Precio para 1 noche, 2 huéspedes</p>
          </div>
        </div>
      </div>
    </div>
  );
}
