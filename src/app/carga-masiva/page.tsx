'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';

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
      addLog(`Columnas encontradas: ${headers.length}`);
      addLog(`Columnas: ${headers.join(', ')}`);
      addLog(`Total de filas: ${dataRows.length}`);
      
      // Simular análisis más detallado
      setTimeout(() => {
        addLog('Análisis de estructura completado');
        addLog('Validando formato de datos...');
        setProcessingStep('processing');
        
        setTimeout(() => {
          addLog('Validación completada');
          addLog('Archivo listo para procesamiento');
          setProcessingStep('completed');
        }, 1000);
      }, 1500);
      
    } catch (error) {
      addLog(`Error al procesar archivo: ${error}`);
      setProcessingStep('error');
    }
  };

  const downloadTemplate = () => {
    const csvContent = `nombre_habitacion,descripcion,precio,capacidad_adultos,capacidad_ninos,comodidades,tamaño,vista,tipo_cama,hotel,ubicacion
Habitación Individual,Comoda habitación para una persona,150000,1,0,"WiFi,Aire acondicionado,TV",10m²,Vista a la ciudad,1 cama individual,Hotel Saana 45,Centro
Habitación Doble,Habitación amplia para dos personas,250000,2,1,"WiFi,Aire acondicionado,TV,Minibar",20m²,Vista al río,1 cama doble,Hotel Boulevar del Rio,Zona ribereña`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'formato_habitaciones.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setProcessingStep('processing');
    addLog('Iniciando carga masiva...');
    
    // Simular carga
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    addLog('Carga completada exitosamente');
    setIsUploading(false);
    setProcessingStep('completed');
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
            Sube archivos CSV para cargar datos de reservas masivamente
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
                <p className="text-sm text-green-700">Completa la plantilla con la información de las habitaciones</p>
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

            <div className="text-center mb-6">
              <button
                onClick={downloadTemplate}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center mx-auto"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Descargar formato CSV
              </button>
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
              {isUploading ? 'Cargando...' : processingStep === 'completed' ? 'Subir archivo' : 'Procesando...'}
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

              {/* Columnas Detectadas */}
              {fileColumns.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-blue-900 font-semibold mb-3">🔍 Columnas Detectadas</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {fileColumns.map((column, index) => (
                      <div key={index} className="bg-white px-3 py-2 rounded border text-sm">
                        <span className="font-medium text-gray-700">{index + 1}.</span> {column}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-sm text-blue-700">
                    <strong>Total de columnas:</strong> {fileColumns.length}
                  </div>
                </div>
              )}

              {/* Tabla de Datos */}
              {fileData.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-gray-900 font-semibold mb-4">📊 Contenido del Archivo</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            #
                          </th>
                          {fileColumns.map((column, index) => (
                            <th key={index} className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {fileData.slice(0, 10).map((row, rowIndex) => (
                          <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium">
                              {rowIndex + 1}
                            </td>
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {fileData.length > 10 && (
                      <div className="mt-3 text-sm text-gray-600 text-center">
                        Mostrando las primeras 10 filas de {fileData.length} filas totales
                      </div>
                    )}
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
              </div>
            </div>
          )}

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">📈 Estadísticas</h3>
              <p className="text-blue-700">Visualiza el progreso de tus cargas masivas</p>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900 mb-2">✅ Validación</h3>
              <p className="text-green-700">Verifica la integridad de tus datos</p>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-900 mb-2">🔄 Procesamiento</h3>
              <p className="text-purple-700">Procesa grandes volúmenes de datos</p>
            </div>
          </div>

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
