'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { saveAs } from 'file-saver';
import { supabase } from '@/lib/supabase';
// Removed server-side dependencies

// NO MÁS DATOS DE EJEMPLO - SOLO DATOS REALES DE LA BASE DE DATOS

function GenerarPDFContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [patientData, setPatientData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const searchParams = useSearchParams();
  const numeroAutorizacion = searchParams.get('auth');

  // Cargar datos del paciente desde Supabase
  useEffect(() => {
    const loadPatientData = async () => {
      if (!numeroAutorizacion) {
        setLoadingData(false);
        return;
      }

      try {
        console.log('Buscando datos para autorización:', numeroAutorizacion);
        
        // Forzar una consulta fresca sin caché
        const { data, error } = await supabase
          .from('informs')
          .select('*')
          .eq('numero_autorizacion', numeroAutorizacion)
          .maybeSingle()
          .abortSignal(AbortSignal.timeout(10000)); // Timeout de 10 segundos

        console.log('Resultado de la consulta:', { data, error });
        console.log('Número de autorización buscado:', numeroAutorizacion);

        if (error) {
          console.error('Error loading patient data:', error);
          setMessage(`Error al cargar los datos del paciente: ${error.message}`);
        } else if (data) {
          console.log('✅ DATOS REALES ENCONTRADOS:', data);
          setPatientData(data);
          setMessage(''); // Limpiar mensaje de error si hay datos
        } else {
          console.log('❌ NO SE ENCONTRARON DATOS para:', numeroAutorizacion);
          setMessage('No se encontraron datos para este número de autorización');
        }
      } catch (err) {
        console.error('Error en la consulta:', err);
        setMessage('Error al cargar los datos');
      } finally {
        setLoadingData(false);
      }
    };

    loadPatientData();
  }, [numeroAutorizacion, retryCount]);

  // Función para forzar recarga de datos
  const forceReloadData = async () => {
    setRetryCount(prev => prev + 1);
    setMessage('Recargando datos...');
    setPatientData(null);
    
    // Limpiar caché del navegador
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }
    
    // Recargar datos
    await loadPatientData();
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleGeneratePDF = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      // SOLO usar datos reales del paciente
      if (!patientData) {
        setMessage('Error: No hay datos del paciente para generar el PDF');
        return;
      }
      
      const dataToUse = patientData;
      
      // Preparar los datos para enviar a la API
      const requestData = {
        hotel: dataToUse.hotel_asignado || '',
        numero_autorizacion: dataToUse.numero_autorizacion || '',
        nombre_paciente: dataToUse.apellidos_y_nombres_paciente || '',
        documento_paciente: dataToUse.numero_documento_paciente || '',
        fecha_llegada: dataToUse.fecha_check_in || '', // Enviar fecha original para cálculo
        fecha_salida: dataToUse.fecha_check_out || '', // Enviar fecha original para cálculo
        tipo_habitacion: dataToUse.descripcion_servicio || 'Habitación Estándar',
        cantidad_habitaciones: dataToUse.cantidad_servicios_autorizados?.toString() || '1',
        telefono: dataToUse.numero_contacto?.toString() || '',
        observaciones: dataToUse.observaciones || '',
        acompañante: dataToUse.apellidos_y_nombres_acompañante || '' // Incluir acompañante
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
      saveAs(pdfBlob, `confirmacion-reserva-${dataToUse.numero_autorizacion || 'demo'}.pdf`);
      
      setMessage('PDF generado y descargado exitosamente desde Word!');
      
    } catch (error) {
      console.error('Error generating PDF from Word:', error);
      setMessage('Error al generar el PDF desde Word. Verifica que el archivo CONFIRMACION-RESERVA-WORD.docx esté en la carpeta public/');
    } finally {
      setIsLoading(false);
    }
  };


  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos del paciente...</p>
        </div>
      </div>
    );
  }

  // Solo mostrar datos reales, no datos de ejemplo
  const dataToShow = patientData;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Generar Comprobante
        </h1>
        
        {numeroAutorizacion && (
          <div className="bg-blue-100 p-3 rounded-lg mb-4">
            <p className="text-sm text-blue-800">
              <strong>Número de autorización:</strong> {numeroAutorizacion}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Intento #{retryCount + 1} • {patientData ? 'Datos cargados' : 'Sin datos'}
            </p>
          </div>
        )}
        
        <div className="space-y-4">
          {dataToShow ? (
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-gray-800">Datos del paciente:</h3>
              <p className="text-sm text-gray-700"><strong className="text-gray-900">Nombre:</strong> {dataToShow.apellidos_y_nombres_paciente}</p>
              <p className="text-sm text-gray-700"><strong className="text-gray-900">Documento:</strong> {dataToShow.numero_documento_paciente}</p>
              <p className="text-sm text-gray-700"><strong className="text-gray-900">Hotel:</strong> {dataToShow.hotel_asignado}</p>
              <p className="text-sm text-gray-700"><strong className="text-gray-900">Check-in:</strong> {formatDate(new Date(new Date(dataToShow.fecha_check_in).getTime() + 24 * 60 * 60 * 1000).toISOString())}</p>
              <p className="text-sm text-gray-700"><strong className="text-gray-900">Check-out:</strong> {formatDate(new Date(new Date(dataToShow.fecha_check_out).getTime() + 24 * 60 * 60 * 1000).toISOString())}</p>
            </div>
          ) : (
            <div className="bg-red-100 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-red-800">⚠️ Sin datos del paciente</h3>
              <p className="text-sm text-red-700">No se encontraron datos para este número de autorización.</p>
            </div>
          )}
          
          <button
            onClick={handleGeneratePDF}
            disabled={isLoading || !dataToShow}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            {isLoading ? 'Generando...' : dataToShow ? 'Descargar comprobante' : 'Sin datos para generar'}
          </button>
          
          {message && (
            <div className={`text-center py-2 px-4 rounded-lg ${
              message.includes('exitosamente') 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {message}
            </div>
          )}
          
          {message && message.includes('No se encontraron datos') && (
            <button
              onClick={forceReloadData}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
            >
              🔄 Recargar datos (Intento #{retryCount + 1})
            </button>
          )}
          
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GenerarPDF() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <GenerarPDFContent />
    </Suspense>
  );
}
