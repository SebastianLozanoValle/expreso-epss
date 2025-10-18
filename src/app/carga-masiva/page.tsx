'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { TablesInsert } from '@/types/supabase';
import { supabase } from '@/lib/supabase';
import { transformCsvDataToInforms, generateCsvTemplate } from '@/lib/data-mapper';

export default function CargaMasivaPage() {
  const router = useRouter();
  
  // Protección de autenticación
  const { user, loading } = useAuthRedirect();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [processingStep, setProcessingStep] = useState<'idle' | 'analyzing' | 'processing' | 'completed' | 'error'>('idle');
  const [fileColumns, setFileColumns] = useState<string[]>([]);
  const [fileData, setFileData] = useState<string[][]>([]);
  const [transformedData, setTransformedData] = useState<TablesInsert<'informs'>[]>([]);
  const [uploadResults, setUploadResults] = useState<{
    success: { numero_autorizacion: string; paciente: string }[];
    failed: { numero_autorizacion: string; paciente: string; error: string }[];
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      setSelectedFile(file);
      processFile(file);
    } else {
      alert('Por favor selecciona un archivo CSV válido');
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => file.type === 'text/csv' || file.name.endsWith('.csv'));
    
    if (csvFile) {
      setSelectedFile(csvFile);
      processFile(csvFile);
    } else {
      alert('Por favor arrastra un archivo CSV válido');
    }
  }, []);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Función para enviar email por cada registro
  const sendEmailForRecord = async (record: any) => {
    try {
      addLog(`📧 Intentando enviar email para ${record.apellidos_y_nombres_paciente} (${record.numero_autorizacion})`);
      
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: user?.email || record.correo,
          numeroAutorizacion: record.numero_autorizacion,
          patientName: record.apellidos_y_nombres_paciente,
        }),
      });

      const responseData = await response.json();
      addLog(`📧 Respuesta del servidor: ${JSON.stringify(responseData)}`);

      if (response.ok) {
        addLog(`✅ Email enviado exitosamente para ${record.apellidos_y_nombres_paciente} (${record.numero_autorizacion})`);
        return true;
      } else {
        addLog(`❌ Error enviando email para ${record.apellidos_y_nombres_paciente}: ${responseData.error || 'Error desconocido'}`);
        return false;
      }
    } catch (error) {
      addLog(`❌ Error de conexión enviando email para ${record.apellidos_y_nombres_paciente}: ${error}`);
      return false;
    }
  };

  const processFile = async (file: File) => {
    setProcessingStep('analyzing');
    setLogs([]);
    addLog('Iniciando análisis del archivo...');
    
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim() !== '');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      // Procesar todas las filas de datos (excluyendo el header)
      const dataRows = lines.slice(1).map(line => 
        line.split(',').map(cell => cell.trim().replace(/"/g, ''))
      );
      
      setFileColumns(headers);
      setFileData(dataRows);
      addLog(`Archivo detectado: ${file.name} (${file.size} bytes)`);
      addLog(`Total de filas: ${dataRows.length}`);
      
      // Transformar datos
      addLog('Transformando datos al formato de la base de datos...');
      const transformed = transformCsvDataToInforms(dataRows, headers, user?.id);
      setTransformedData(transformed);
      addLog(`Datos transformados: ${transformed.length} registros`);
      
      // Validación básica (sin bloqueos)
      addLog('Validación básica completada...');
      addLog(`Total de registros procesados: ${transformed.length}`);
      
      setProcessingStep('completed');
      
    } catch (error) {
      addLog(`Error al procesar archivo: ${error}`);
      setProcessingStep('error');
    }
  };

  const downloadTemplate = () => {
    const csvContent = generateCsvTemplate();
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'formato_informs.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetForm = () => {
    setTransformedData([]);
    setFileData([]);
    setFileColumns([]);
    setSelectedFile(null);
    setLogs([]);
    setProcessingStep('idle');
    setUploadResults(null);
    addLog('Formulario reseteado manualmente.');
  };

  const handleUpload = async () => {
    if (!fileData.length) {
      addLog('No hay datos para subir');
      return;
    }
    
    setIsUploading(true);
    setProcessingStep('processing');
    addLog('Iniciando carga masiva a la base de datos...');
    
    try {
      // Usar datos transformados si existen, sino usar datos originales
      const dataToUpload = transformedData.length > 0 ? transformedData : fileData.map(row => {
        const rowData: {[key: string]: string | number | boolean | null} = {
          user_id: user?.id || '',
        };
        
        // Mapeo por posición (basado en tu CSV)
        // CC	102238	RODRIGUEZ RODRIGUEZ LINA	30	S	HOTEL HABITACION SENCILLA YOPAL	YOPAL	298756457	8	3105555555	NO	N/A	N/A	N/A	N/A	9/30/2025	11:00 AM	N/A	N/A	NO POS	1234567812	9/30/2025	31/09/2025	rodriguez@hotmail.com	-	SOLO SERVICIO DE ALOJAMIENTO NO CUBRE TRANSPORTES NI ALIMENTACION
        
        if (row.length >= 26) {
          // Mapeo por posición exacta
          rowData.tipo_documento_paciente = row[0] || null; // CC
          rowData.numero_documento_paciente = row[1] || null; // 102238
          rowData.apellidos_y_nombres_paciente = row[2] || null; // RODRIGUEZ RODRIGUEZ LINA
          rowData.edad_paciente = row[3] ? parseInt(row[3]) : null; // 30
          rowData.regimen = row[4] || null; // S
          rowData.descripcion_servicio = row[5] || null; // HOTEL HABITACION SENCILLA YOPAL
          rowData.destino = row[6] || null; // YOPAL
          rowData.numero_autorizacion = row[7] || null; // 298756457
          rowData.cantidad_servicios_autorizados = row[8] ? parseInt(row[8]) : null; // 8
          rowData.numero_contacto = row[9] ? parseInt(row[9]) : null; // 3105555555
          rowData.requiere_acompañante = row[10] === 'SI' || row[10] === 'S'; // NO
          rowData.tipo_documento_acompañante = row[11] !== 'N/A' ? row[11] : null; // N/A
          rowData.numero_documento_acompañante = row[12] !== 'N/A' ? row[12] : null; // N/A
          rowData.apellidos_y_nombres_acompañante = row[13] !== 'N/A' ? row[13] : null; // N/A
          rowData.parentesco_acompañante = row[14] !== 'N/A' ? row[14] : null; // N/A
          rowData.fecha_cita = row[15] || null; // 9/30/2025
          rowData.hora_cita = row[16] || null; // 11:00 AM
          rowData.fecha_ultima_cita = row[17] !== 'N/A' ? row[17] : null; // N/A
          rowData.hora_ultima_cita = row[18] !== 'N/A' ? row[18] : null; // N/A
          rowData.POS = row[19] === 'POS'; // NO POS
          rowData.MIPRES = row[20] || null; // 1234567812
          rowData.fecha_check_in = row[21] || null; // 9/30/2025
          rowData.fecha_check_out = row[22] || null; // 31/09/2025
          rowData.correo = row[23] || null; // rodriguez@hotmail.com
          rowData.hotel_asignado = row[24] !== '-' ? row[24] : null; // -
          rowData.observaciones = row[25] || null; // SOLO SERVICIO DE ALOJAMIENTO...
        }
        
        return rowData;
      });
      
      addLog(`Subiendo ${dataToUpload.length} registros...`);
      
      // Intentar insertar todos los registros
        const { error } = await supabase
        .from('informs')
        .insert(dataToUpload as TablesInsert<'informs'>[]);
      
      if (error) {
        // Analizar el error de Supabase
        addLog(`❌ Error en la inserción: ${error.message}`);
        
        // Si es un error de duplicados o restricciones, intentar uno por uno
        if (error.code === '23505' || error.message.includes('duplicate') || error.message.includes('constraint')) {
          addLog('🔄 Intentando insertar registros uno por uno para identificar errores específicos...');
          
        // let successCount = 0;
        // let errorCount = 0;
          const successRecords: { numero_autorizacion: string; paciente: string }[] = [];
          const failedRecords: { numero_autorizacion: string; paciente: string; error: string }[] = [];
          
          for (let i = 0; i < dataToUpload.length; i++) {
            const record = dataToUpload[i];
            try {
              const { error: singleError } = await supabase
                .from('informs')
                .insert([record as TablesInsert<'informs'>]);
              
              if (singleError) {
                // errorCount++;
                // Traducir errores técnicos a mensajes comprensibles
                let errorMessage = singleError.message;
                
                if (singleError.message.includes('duplicate key value violates unique constraint "informs_pkey"')) {
                  errorMessage = 'Este registro ya existe en la base de datos (registro duplicado)';
                } else if (singleError.message.includes('duplicate key value violates unique constraint "informs_numero_autorizacion_key"')) {
                  errorMessage = 'Este número de autorización ya existe en la base de datos';
                } else if (singleError.message.includes('violates foreign key constraint')) {
                  errorMessage = 'Datos relacionados no existen (hotel, usuario, etc.)';
                } else if (singleError.message.includes('violates check constraint')) {
                  errorMessage = 'Los datos no cumplen con las reglas de validación';
                } else if (singleError.message.includes('not-null constraint')) {
                  errorMessage = 'Faltan datos obligatorios';
                } else if (singleError.message.includes('value too long')) {
                  errorMessage = 'Algún campo es demasiado largo';
                } else if (singleError.message.includes('invalid input syntax')) {
                  errorMessage = 'Formato de datos incorrecto (fecha, número, etc.)';
                }
                
                failedRecords.push({
                  numero_autorizacion: String(record.numero_autorizacion || 'Sin número'),
                  paciente: String(record.apellidos_y_nombres_paciente || 'Sin nombre'),
                  error: errorMessage
                });
              } else {
                // successCount++;
                successRecords.push({
                  numero_autorizacion: String(record.numero_autorizacion || 'Sin número'),
                  paciente: String(record.apellidos_y_nombres_paciente || 'Sin nombre')
                });
                
                // Enviar email para el registro exitoso
                await sendEmailForRecord(record);
              }
            } catch (singleError) {
              // errorCount++;
              let errorMessage = 'Error desconocido';
              
              if (singleError instanceof Error) {
                // Aplicar las mismas traducciones para errores en catch
                if (singleError.message.includes('duplicate key value violates unique constraint "informs_pkey"')) {
                  errorMessage = 'Este registro ya existe en la base de datos (registro duplicado)';
                } else if (singleError.message.includes('duplicate key value violates unique constraint "informs_numero_autorizacion_key"')) {
                  errorMessage = 'Este número de autorización ya existe en la base de datos';
                } else if (singleError.message.includes('violates foreign key constraint')) {
                  errorMessage = 'Datos relacionados no existen (hotel, usuario, etc.)';
                } else if (singleError.message.includes('violates check constraint')) {
                  errorMessage = 'Los datos no cumplen con las reglas de validación';
                } else if (singleError.message.includes('not-null constraint')) {
                  errorMessage = 'Faltan datos obligatorios';
                } else if (singleError.message.includes('value too long')) {
                  errorMessage = 'Algún campo es demasiado largo';
                } else if (singleError.message.includes('invalid input syntax')) {
                  errorMessage = 'Formato de datos incorrecto (fecha, número, etc.)';
                } else {
                  errorMessage = singleError.message;
                }
              }
              
              failedRecords.push({
                numero_autorizacion: String(record.numero_autorizacion || 'Sin número'),
                paciente: String(record.apellidos_y_nombres_paciente || 'Sin nombre'),
                error: errorMessage
              });
            }
          }
          
          // Guardar resultados para mostrar en tarjetas
          setUploadResults({
            success: successRecords,
            failed: failedRecords
          });
        } else {
          // Otro tipo de error
          throw error;
        }
      } else {
        // Todos los registros se insertaron correctamente
        const successRecords = dataToUpload.map(record => ({
          numero_autorizacion: String(record.numero_autorizacion || 'Sin número'),
          paciente: String(record.apellidos_y_nombres_paciente || 'Sin nombre')
        }));
        
        setUploadResults({
          success: successRecords,
          failed: []
        });
        
        // Enviar emails para todos los registros exitosos
        addLog('📧 Enviando emails de confirmación...');
        for (const record of dataToUpload) {
          await sendEmailForRecord(record);
        }
      }
      
      // Actualizar estado a completado
      setProcessingStep('completed');
      
    } catch (error) {
      addLog(`❌ Error al subir datos: ${error}`);
      setProcessingStep('error');
    } finally {
      setIsUploading(false);
    }
  };

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-6">
            Carga Masiva
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Sube archivos CSV para cargar datos de informes médicos masivamente. 
            Proceso rápido y seguro.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Proceso de Carga Masiva
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-900">1. Descarga el formato</h3>
                <p className="text-sm text-green-700">Obtén la plantilla CSV con el formato correcto</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-900">2. Inserta los datos</h3>
                <p className="text-sm text-green-700">Completa la plantilla con la información de los informes médicos</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-semibold text-yellow-900">3. Sube el archivo</h3>
                <p className="text-sm text-yellow-700">Carga el archivo CSV completado</p>
              </div>
              <div className="text-center p-4 bg-emerald-50 rounded-lg">
                <h3 className="font-semibold text-emerald-900">4. Espera la carga</h3>
                <p className="text-sm text-emerald-700">El sistema procesará y validará los datos</p>
              </div>
            </div>

            <div className="text-center mb-6 space-x-4">
              <button
                onClick={downloadTemplate}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center mx-auto"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Descargar formato CSV
              </button>
              
              {(fileData.length > 0 || processingStep !== 'idle') && (
                <button
                  onClick={resetForm}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center mx-auto"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Resetear Formulario
                </button>
              )}
            </div>
          </div>

          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
              isDragOver 
                ? 'border-teal-500 bg-teal-50' 
                : 'border-gray-300 hover:border-teal-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="mb-4">
              <svg className={`mx-auto h-12 w-12 ${isDragOver ? 'text-teal-500' : 'text-gray-400'}`} stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            
            <div className="mb-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className={`text-lg font-medium ${isDragOver ? 'text-teal-600' : 'text-teal-600 hover:text-teal-500'}`}>
                  {isDragOver ? 'Suelta el archivo aquí' : 'Seleccionar archivo CSV'}
                </span>
                <input
                  id="file-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <p className={`text-sm mt-2 ${isDragOver ? 'text-teal-600' : 'text-gray-500'}`}>
                {isDragOver ? 'Archivo detectado' : 'o arrastra y suelta el archivo aquí'}
              </p>
            </div>

            {selectedFile && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-green-800">
                    Archivo seleccionado: {selectedFile.name}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Logs y Análisis de Datos */}
          {(logs.length > 0 || fileColumns.length > 0) && (
            <div className="mt-8 space-y-6">
              {/* Logs de Procesamiento */}
              {/* <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                <h3 className="text-white font-semibold mb-3">📋 Logs de Procesamiento</h3>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {logs.map((log, index) => (
                    <div key={index} className="text-xs">
                      {log}
                    </div>
                  ))}
                </div>
              </div> */}

              {/* Tabla de Datos Originales - TODAS las Columnas */}
              {fileData.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-gray-900 font-semibold mb-4">Datos Originales del CSV (Todas las Columnas)</h3>
                  <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="min-w-full border border-gray-300">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                            #
                          </th>
                          {fileColumns.map((column, index) => (
                            <th key={index} className="border border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-32">
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {fileData.slice(0, 5).map((row, rowIndex) => (
                          <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="border border-gray-300 px-2 py-2 text-sm text-gray-900 font-medium sticky left-0 bg-white z-10">
                              {rowIndex + 1}
                            </td>
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} className="border border-gray-300 px-2 py-2 text-sm text-gray-900 max-w-32 truncate" title={cell}>
                                {cell || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {fileData.length > 5 && (
                      <div className="mt-3 text-sm text-gray-600 text-center">
                        Mostrando las primeras 5 filas de {fileData.length} filas totales
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tabla de Datos Transformados - Solo las Mapeadas */}
              {transformedData.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-gray-900 font-semibold mb-4">Datos Transformados para la Base de Datos (Solo Columnas Mapeadas)</h3>
                  <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="min-w-full border border-gray-300">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                            #
                          </th>
                          {Object.keys(transformedData[0] || {}).map((key, index) => (
                            <th key={index} className="border border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-32">
                              {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {transformedData.slice(0, 5).map((row, rowIndex) => (
                          <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="border border-gray-300 px-2 py-2 text-sm text-gray-900 font-medium sticky left-0 bg-white z-10">
                              {rowIndex + 1}
                            </td>
                            {Object.entries(row).map(([, value], cellIndex) => (
                              <td key={cellIndex} className="border border-gray-300 px-2 py-2 text-sm text-gray-900 max-w-32 truncate" title={String(value || '')}>
                                {value !== null && value !== undefined ? String(value) : '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {transformedData.length > 5 && (
                      <div className="mt-3 text-sm text-gray-600 text-center">
                        Mostrando las primeras 5 filas de {transformedData.length} filas totales para depuración
                      </div>
                    )}
                  </div>
                  
                  {/* Información de depuración */}
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="text-yellow-800 font-semibold text-sm mb-2">Información de Mapeo</h4>
                    <div className="text-yellow-700 text-xs space-y-1">
                      <div><strong>Columnas mapeadas:</strong> {Object.keys(transformedData[0] || {}).length}</div>
                      <div><strong>Columnas no mapeadas:</strong> {fileColumns.length - Object.keys(transformedData[0] || {}).length}</div>
                      <div><strong>Campos con datos:</strong> {Object.values(transformedData[0] || {}).filter(v => v !== null && v !== undefined && v !== '').length}</div>
                      <div><strong>Campos vacíos:</strong> {Object.values(transformedData[0] || {}).filter(v => v === null || v === undefined || v === '').length}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* BOTÓN PARA SUBIR - SIEMPRE VISIBLE */}
              {selectedFile && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <h3 className="text-lg font-semibold text-green-900 mb-4">
                    SUBIR DATOS A LA BASE DE DATOS
                  </h3>
                  <p className="text-green-700 mb-6">
                    Haz clic para subir los datos procesados a Supabase. Si hay errores, el servidor los reportará.
                  </p>
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors flex items-center mx-auto"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        SUBIR DATOS
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* TARJETAS DE RESULTADOS */}
              {uploadResults && (
                <div className="mt-8 space-y-6">
                  {/* TARJETA DE ÉXITOS */}
                  {uploadResults.success.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-green-900">
                          Registros Insertados Exitosamente ({uploadResults.success.length})
                        </h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        <div className="space-y-2">
                          {uploadResults.success.map((record, index) => (
                            <div key={index} className="bg-green-100 border border-green-300 rounded-lg p-3">
                              <div className="flex justify-between items-center">
                                <div>
                                  <span className="font-medium text-green-900">
                                    #{record.numero_autorizacion}
                                  </span>
                                  <span className="text-green-700 ml-2">
                                    - {record.paciente}
                                  </span>
                                </div>
                                <span className="text-green-600 text-sm">✓ Insertado</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TARJETA DE FALLOS */}
                  {uploadResults.failed.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-red-900">
                        Registros que Fallaron ({uploadResults.failed.length})
                        </h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        <div className="space-y-2">
                          {uploadResults.failed.map((record, index) => (
                            <div key={index} className="bg-red-100 border border-red-300 rounded-lg p-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="font-medium text-red-900">
                                    #{record.numero_autorizacion}
                                  </span>
                                  <span className="text-red-700 ml-2">
                                    - {record.paciente}
                                  </span>
                                </div>
                                <span className="text-red-600 text-sm">✗ Falló</span>
                              </div>
                              <div className="mt-2 text-sm text-red-700 bg-red-200 rounded p-2">
                                <strong>Motivo:</strong> {record.error}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* RESUMEN GENERAL */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">
                    Resumen de la Carga
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {uploadResults.success.length + uploadResults.failed.length}
                        </div>
                        <div className="text-sm text-blue-700">Total Registros</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {uploadResults.success.length}
                        </div>
                        <div className="text-sm text-green-700">Exitosos</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {uploadResults.failed.length}
                        </div>
                        <div className="text-sm text-red-700">Fallaron</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Estado del Procesamiento */}
          {processingStep !== 'idle' && (
            <div className="mt-6">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">Estado del Procesamiento</h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    processingStep === 'completed' ? 'bg-green-100 text-green-800' :
                    processingStep === 'error' ? 'bg-red-100 text-red-800' :
                    processingStep === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {processingStep === 'analyzing' ? 'Analizando' :
                     processingStep === 'processing' ? 'Procesando' :
                     processingStep === 'completed' ? 'Completado' :
                     processingStep === 'error' ? 'Error' : 'Inactivo'}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`h-2 rounded-full transition-all duration-500 ${
                    processingStep === 'completed' ? 'bg-green-500 w-full' :
                    processingStep === 'error' ? 'bg-red-500 w-full' :
                    processingStep === 'processing' ? 'bg-yellow-500 w-3/4' :
                    'bg-blue-500 w-1/4'
                  }`}></div>
                </div>
                
                {/* Mensaje de éxito cuando se completa la subida */}
                {processingStep === 'completed' && logs.some(log => log.includes('Carga completada exitosamente')) && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h4 className="text-green-800 font-semibold">¡Subida Exitosa!</h4>
                        <p className="text-green-700 text-sm">Los datos han sido guardados correctamente en la base de datos.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}