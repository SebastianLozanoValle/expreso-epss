'use client';

import { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import { Tables } from '@/types/supabase';

interface Reserva extends Omit<Tables<'informs'>, 'fecha_creacion'> {
  fecha_creacion?: string;
  is_active?: boolean;
  cancelled_by?: string;
  cancelled_at?: string;
}

interface DownloadModalProps {
  reserva: Reserva | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DownloadModal({ reserva, isOpen, onClose }: DownloadModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!isOpen || !reserva) return null;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Parsear descripcion_servicio para separar tipo de habitación y observaciones
  const parseDescripcionServicio = () => {
    let tipoHabitacion = 'Habitación Estándar';
    let observacionesReales = reserva.observaciones || '';
    let descripcionServicio = '';
    
    if (reserva.descripcion_servicio && reserva.descripcion_servicio.includes(' / ')) {
      const partes = reserva.descripcion_servicio.split(' / ');
      tipoHabitacion = partes[0] || 'Habitación Estándar';
      observacionesReales = partes[1] || observacionesReales;
      descripcionServicio = partes[1] || '';
    } else {
      // Si no hay /, mostrar el descripcion_servicio completo
      descripcionServicio = reserva.descripcion_servicio || '';
    }
    
    return { tipoHabitacion, observacionesReales, descripcionServicio };
  };

  const { tipoHabitacion, observacionesReales, descripcionServicio } = parseDescripcionServicio();

  const handleGeneratePDF = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      // Preparar los datos para enviar a la API
      const requestData = {
        hotel: reserva.hotel_asignado || '',
        numero_autorizacion: reserva.numero_autorizacion || '',
        nombre_paciente: reserva.apellidos_y_nombres_paciente || '',
        documento_paciente: reserva.numero_documento_paciente || '',
        fecha_llegada: reserva.fecha_check_in || '',
        fecha_salida: reserva.fecha_check_out || '',
        descripcion_servicio: reserva.descripcion_servicio || '',
        cantidad_habitaciones: reserva.cantidad_servicios_autorizados?.toString() || '1',
        telefono: reserva.numero_contacto?.toString() || '',
        observaciones: reserva.observaciones || '',
        acompañante: reserva.apellidos_y_nombres_acompañante || '',
        documento_acompañante: reserva.numero_documento_acompañante || ''
      };

      // Llamar a la API para generar el PDF
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error('Error al generar el PDF');
      }

      // Obtener el PDF como blob
      const pdfBlob = await response.blob();
      
      // Descargar el PDF
      saveAs(pdfBlob, `confirmacion-reserva-${reserva.numero_autorizacion || 'demo'}.pdf`);
      
      setMessage('PDF generado y descargado exitosamente!');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setMessage('Error al generar el PDF. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Descargar Comprobante</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Información de la reserva */}
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2 text-gray-800">Datos de la reserva:</h3>
            <p className="text-sm text-gray-700">
              <strong className="text-gray-900">Paciente:</strong> {reserva.apellidos_y_nombres_paciente}
            </p>
            <p className="text-sm text-gray-700">
              <strong className="text-gray-900">Documento:</strong> {reserva.numero_documento_paciente}
            </p>
            <p className="text-sm text-gray-700">
              <strong className="text-gray-900">Hotel:</strong> {reserva.hotel_asignado}
            </p>
            <p className="text-sm text-gray-700">
              <strong className="text-gray-900">Check-in:</strong> {formatDate(reserva.fecha_check_in || '')}
            </p>
            <p className="text-sm text-gray-700">
              <strong className="text-gray-900">Check-out:</strong> {formatDate(reserva.fecha_check_out || '')}
            </p>
            <p className="text-sm text-gray-700">
              <strong className="text-gray-900">Descripción del Servicio:</strong> {descripcionServicio || ''}
            </p>
            <p className="text-sm text-gray-700">
              <strong className="text-gray-900">Tipo de Habitación:</strong> {tipoHabitacion}
            </p>
            {observacionesReales && (
              <p className="text-sm text-gray-700">
                <strong className="text-gray-900">Observaciones:</strong> {observacionesReales}
              </p>
            )}
            {reserva.apellidos_y_nombres_acompañante && (
              <p className="text-sm text-gray-700">
                <strong className="text-gray-900">Acompañante:</strong> {reserva.apellidos_y_nombres_acompañante}
              </p>
            )}
          </div>

          {/* Botón de descarga */}
          <button
            onClick={handleGeneratePDF}
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors mb-4"
          >
            {isLoading ? 'Generando PDF...' : '📄 Descargar Comprobante'}
          </button>

          {/* Mensaje de estado */}
          {message && (
            <div className={`text-center py-2 px-4 rounded-lg ${
              message.includes('exitosamente') 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {message}
            </div>
          )}

          {/* Botón de cerrar */}
          <button
            onClick={onClose}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors mt-2"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
