'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { supabase } from '@/lib/supabase';
import { transformCsvDataToInforms, validateTransformedData, generateCsvTemplate, COLUMN_MAPPING } from '@/lib/data-mapper';
import { TablesInsert } from '@/types/supabase';

export default function CargaMasivaPage() {
  const router = useRouter();
  
  // Protección de autenticación
  const { user, loading, isAuthenticated } = useAuthRedirect();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [processingStep, setProcessingStep] = useState<'idle' | 'analyzing' | 'processing' | 'completed' | 'error'>('idle');
  const [fileColumns, setFileColumns] = useState<string[]>([]);
  const [fileData, setFileData] = useState<string[][]>([]);
  const [transformedData, setTransformedData] = useState<TablesInsert<'informs'>[]>([]);
  const [validationResults, setValidationResults] = useState<{
    valid: TablesInsert<'informs'>[];
    invalid: { row: number; errors: string[] }[];
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
          // addLog(`Columnas encontradas: ${headers.length}`);
          // addLog(`Columnas: ${headers.join(', ')}`);
          addLog(`Total de filas: ${dataRows.length}`);
      
      // Transformar datos
      addLog('Transformando datos al formato de la base de datos...');
      const transformed = transformCsvDataToInforms(dataRows, headers);
      setTransformedData(transformed);
      addLog(`Datos transformados: ${transformed.length} registros`);
      
      // Debug: mostrar información de mapeo
      // if (transformed.length > 0) {
      //   const fieldsCount = Object.keys(transformed[0]).length;
      //   addLog(`Campos mapeados por registro: ${fieldsCount}`);
      //   addLog(`Columnas detectadas en CSV: ${headers.length}`);
      //   addLog(`Diferencia: ${headers.length - fieldsCount} columnas no mapeadas`);
      // }
      
      // Validar datos
      addLog('Validando datos transformados...');
      const validation = validateTransformedData(transformed);
      setValidationResults(validation);
      
      // addLog(`Registros válidos: ${validation.valid.length}`);
      // addLog(`Registros con errores: ${validation.invalid.length}`);
      
      // if (validation.invalid.length > 0) {
      //   addLog('Errores encontrados:');
      //   validation.invalid.forEach(({ row, errors }) => {
      //     addLog(`  Fila ${row}: ${errors.join(', ')}`);
      //   });
      // }
      
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
    setValidationResults(null);
    setFileData([]);
    setFileColumns([]);
    setSelectedFile(null);
    setLogs([]);
    setProcessingStep('idle');
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
      // FORZAR usar SOLO datos originales del CSV, NO los transformados
      const dataToUpload = fileData.map(row => {
        const rowData: any = {};
        
        // Mapeo directo del CSV a Supabase
        fileColumns.forEach((column, index) => {
          const value = row[index];
          
          // Solo mapear campos que tienen datos reales
          if (value && value.trim() !== '' && value !== 'N/A') {
            switch (column.trim()) {
              case 'APELLIDOS Y NOMBRES PACIENTE':
                rowData.apellidos_y_nombres_paciente = value;
                break;
              case 'N�MERO DOCUMENTO PACIENTE':
                rowData.numero_documento_paciente = value;
                break;
              case 'EDAD PACIENTE':
                const edad = parseInt(value);
                if (!isNaN(edad)) {
                  rowData.edad_paciente = edad;
                }
                break;
              case 'No. DE AUTORIZACION':
                rowData.numero_autorizacion = value;
                break;
              case 'HOTEL ASIGNADO':
                rowData.hotel_asignado = value;
                break;
              case 'FECHA DE CITA':
                rowData.fecha_cita = value;
                break;
              case 'CORREO':
                rowData.correo = value;
                break;
              case 'OBSERVACIONES':
                rowData.observaciones = value;
                break;
              case 'TIPO DOCUMENTO PACIENTE':
                rowData.tipo_documento_paciente = value;
                break;
              case 'REGIMEN':
                rowData.regimen = value;
                break;
              case 'DESCRIPCION DEL SERVICIO':
                rowData.descripcion_servicio = value;
                break;
              case 'DESTINO':
                rowData.destino = value;
                break;
            }
          }
        });
        
        return rowData;
      });
      
       addLog(`Subiendo ${dataToUpload.length} registros...`);
       // addLog(`=== DATOS QUE SE VAN A ENVIAR A SUPABASE ===`);
       // addLog(JSON.stringify(dataToUpload, null, 2));
       // addLog(`=== FIN DE DATOS ===`);
       
       const { data, error } = await supabase
         .from('informs')
         .insert(dataToUpload);
      
      if (error) {
        throw error;
      }
      
      addLog(`✅ Carga completada exitosamente: ${dataToUpload.length} registros insertados`);
      addLog('Los datos han sido guardados en la base de datos');
      
      // Actualizar estado a completado
      setProcessingStep('completed');
      
      // Resetear el formulario después de 3 segundos
      setTimeout(() => {
        // Limpiar todos los estados
        setTransformedData([]);
        setValidationResults(null);
        setFileData([]);
        setFileColumns([]);
        setSelectedFile(null);
        setLogs([]);
        setProcessingStep('idle');
        
        // Agregar mensaje de reset
        setTimeout(() => {
          addLog('Formulario reseteado. Puedes cargar un nuevo archivo.');
        }, 100);
      }, 3000);
      
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📊 Carga Masiva
          </h1>
          <p className="text-lg text-gray-600">
            Sube archivos CSV para cargar datos de informes médicos masivamente
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Proceso de Carga Masiva
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl mb-2">📥</div>
                <h3 className="font-semibold text-blue-900">1. Descarga el formato</h3>
                <p className="text-sm text-blue-700">Obtén la plantilla CSV con el formato correcto</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl mb-2">✏️</div>
                <h3 className="font-semibold text-green-900">2. Inserta los datos</h3>
                <p className="text-sm text-green-700">Completa la plantilla con la información de los informes médicos</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl mb-2">📤</div>
                <h3 className="font-semibold text-yellow-900">3. Sube el archivo</h3>
                <p className="text-sm text-yellow-700">Carga el archivo CSV completado</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl mb-2">⏳</div>
                <h3 className="font-semibold text-purple-900">4. Espera la carga</h3>
                <p className="text-sm text-purple-700">El sistema procesará y validará los datos</p>
              </div>
            </div>

            <div className="text-center mb-6 space-x-4">
              <button
                onClick={downloadTemplate}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center mx-auto"
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

            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading || processingStep !== 'completed'}
              className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {isUploading ? 'Subiendo...' : processingStep === 'completed' ? 'Subir archivo' : 'Procesando...'}
            </button>
          </div>

          {/* Logs y Análisis de Datos */}
          {(logs.length > 0 || fileColumns.length > 0) && (
            <div className="mt-8 space-y-6">
              {/* Logs de Procesamiento */}
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                <h3 className="text-white font-semibold mb-3">📋 Logs de Procesamiento</h3>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {logs.map((log, index) => (
                    <div key={index} className="text-xs">
                      {log}
                    </div>
                  ))}
                </div>
              </div>

              

              {/* Tabla de Datos Originales - TODAS las 26 Columnas */}
              {fileData.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-gray-900 font-semibold mb-4">📊 Datos Originales del CSV (Todas las 26 Columnas)</h3>
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
                  <h3 className="text-gray-900 font-semibold mb-4">📊 Datos Transformados para la Base de Datos (Solo Columnas Mapeadas)</h3>
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
                            {Object.entries(row).map(([key, value], cellIndex) => (
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
                    <h4 className="text-yellow-800 font-semibold text-sm mb-2">⚠️ Información de Mapeo</h4>
                    <div className="text-yellow-700 text-xs space-y-1">
                      <div><strong>Columnas mapeadas:</strong> {Object.keys(transformedData[0] || {}).length}</div>
                      <div><strong>Columnas no mapeadas:</strong> {fileColumns.length - Object.keys(transformedData[0] || {}).length}</div>
                      <div><strong>Campos con datos:</strong> {Object.values(transformedData[0] || {}).filter(v => v !== null && v !== undefined && v !== '').length}</div>
                      <div><strong>Campos vacíos:</strong> {Object.values(transformedData[0] || {}).filter(v => v === null || v === undefined || v === '').length}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Resumen de Validación */}
              {/* {validationResults && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-gray-900 font-semibold mb-4">✅ Resumen de Validación</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{validationResults.valid.length}</div>
                      <div className="text-sm text-green-700">Registros Válidos</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{validationResults.invalid.length}</div>
                      <div className="text-sm text-red-700">Registros con Errores</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{transformedData.length}</div>
                      <div className="text-sm text-blue-700">Total de Registros</div>
                    </div>
                  </div>
                  
                  {validationResults.invalid.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-red-700 mb-2">Errores Encontrados:</h4>
                      <div className="max-h-32 overflow-y-auto">
                        {validationResults.invalid.map(({ row, errors }, index) => (
                          <div key={index} className="text-sm text-red-600 mb-1">
                            <strong>Fila {row}:</strong> {errors.join(', ')}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )} */}

              {/* Debug: Mostrar estado de validación */}
              {/* {validationResults && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <h4 className="text-yellow-800 font-semibold text-sm mb-2">🔍 Debug - Estado de Validación</h4>
                  <div className="text-yellow-700 text-xs space-y-1">
                    <div><strong>validationResults existe:</strong> {validationResults ? 'Sí' : 'No'}</div>
                    <div><strong>Registros válidos:</strong> {validationResults?.valid.length || 0}</div>
                    <div><strong>Registros con errores:</strong> {validationResults?.invalid.length || 0}</div>
                    <div><strong>¿Mostrar botón?:</strong> {validationResults && validationResults.valid.length > 0 ? 'Sí' : 'No'}</div>
                  </div>
                </div>
              )} */}

              {/* BOTÓN PARA SUBIR - SIEMPRE VISIBLE */}
              {fileData.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <h3 className="text-lg font-semibold text-green-900 mb-4">
                    🚀 SUBIR DATOS A LA BASE DE DATOS
                  </h3>
                  <p className="text-green-700 mb-6">
                    Haz clic para subir los datos procesados a Supabase.
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
