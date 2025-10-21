'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { supabase } from '@/lib/supabase';
import { Tables } from '@/types/supabase';
import toast, { Toaster } from 'react-hot-toast';

interface Reserva extends Omit<Tables<'informs'>, 'fecha_creacion'> {
  fecha_creacion?: string;
  is_active?: boolean;
  cancelled_by?: string;
  cancelled_at?: string;
}

interface ReservaModalProps {
  reserva: Reserva | null;
  isOpen: boolean;
  onClose: () => void;
}

function ReservaModal({ reserva, isOpen, onClose }: ReservaModalProps) {
  if (!isOpen || !reserva) return null;

  // Calcular precio basado en el hotel y cantidad de inquilinos
  const calcularPrecio = () => {
    let precioBase = 0;
    const hotel = reserva.hotel_asignado?.toLowerCase() || '';
    
    if (hotel.includes('ilar 74') || hotel.includes('bogotá') || hotel.includes('bogota')) {
      precioBase = 133256;
    } else if (hotel.includes('saana 45') || hotel.includes('medellín') || hotel.includes('medellin')) {
      precioBase = 163841;
    } else if (hotel.includes('bulevar del rio') || hotel.includes('cali')) {
      precioBase = 182011;
    }

    // Calcular cantidad de inquilinos (usuario + acompañante si existe)
    let cantidadInquilinos = 1;
    if (reserva.apellidos_y_nombres_acompañante && reserva.apellidos_y_nombres_acompañante.trim() !== '') {
      cantidadInquilinos = 2;
    }

    // Calcular precio según cantidad de inquilinos
    let precioPorPersona = precioBase;
    if (cantidadInquilinos === 2) {
      precioPorPersona = Math.round(precioBase * 1.5);
    } else if (cantidadInquilinos >= 3) {
      precioPorPersona = precioBase * 2;
    }

    // Calcular cantidad de noches
    let cantidadNoches = 1;
    if (reserva.fecha_check_in && reserva.fecha_check_out) {
      try {
        const fechaLlegada = new Date(reserva.fecha_check_in);
        const fechaSalida = new Date(reserva.fecha_check_out);
        const diferenciaMs = fechaSalida.getTime() - fechaLlegada.getTime();
        const diferenciaDias = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));
        if (diferenciaDias > 0 && diferenciaDias <= 30) {
          cantidadNoches = diferenciaDias;
        }
      } catch (error) {
        console.log('Error calculando fechas:', error);
      }
    }

    return precioPorPersona * cantidadNoches;
  };

  const precioTotal = calcularPrecio();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Detalles de la Reserva</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información del Paciente */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Información del Paciente</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                <p className="mt-1 text-sm text-gray-900">{reserva.apellidos_y_nombres_paciente || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Documento</label>
                <p className="mt-1 text-sm text-gray-900">
                  {reserva.tipo_documento_paciente} {reserva.numero_documento_paciente}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Edad</label>
                <p className="mt-1 text-sm text-gray-900">{reserva.edad_paciente || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Régimen</label>
                <p className="mt-1 text-sm text-gray-900">{reserva.regimen || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                <p className="mt-1 text-sm text-gray-900">{reserva.numero_contacto || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{reserva.correo || 'N/A'}</p>
              </div>
            </div>

            {/* Información de la Reserva */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Información de la Reserva</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Número de Autorización</label>
                <p className="mt-1 text-sm text-gray-900 font-mono">{reserva.numero_autorizacion || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Hotel Asignado</label>
                <p className="mt-1 text-sm text-gray-900">{reserva.hotel_asignado || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Destino</label>
                <p className="mt-1 text-sm text-gray-900">{reserva.destino || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo de Habitación</label>
                <p className="mt-1 text-sm text-gray-900">Habitación Estándar</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Check-in</label>
                <p className="mt-1 text-sm text-gray-900">
                  {reserva.fecha_check_in ? new Date(reserva.fecha_check_in).toLocaleDateString('es-ES') : 'N/A'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Check-out</label>
                <p className="mt-1 text-sm text-gray-900">
                  {reserva.fecha_check_out ? new Date(reserva.fecha_check_out).toLocaleDateString('es-ES') : 'N/A'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de Cita</label>
                <p className="mt-1 text-sm text-gray-900">
                  {reserva.fecha_cita ? new Date(reserva.fecha_cita).toLocaleDateString('es-ES') : 'N/A'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Hora de Cita</label>
                <p className="mt-1 text-sm text-gray-900">{reserva.hora_cita || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Acompañante */}
          {reserva.apellidos_y_nombres_acompañante && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Información del Acompañante</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                  <p className="mt-1 text-sm text-gray-900">{reserva.apellidos_y_nombres_acompañante}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Documento</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {reserva.tipo_documento_acompañante} {reserva.numero_documento_acompañante}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Parentesco</label>
                  <p className="mt-1 text-sm text-gray-900">{reserva.parentesco_acompañante || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Observaciones */}
          {reserva.observaciones && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Observaciones</h3>
              <p className="mt-2 text-sm text-gray-900 whitespace-pre-wrap">{reserva.observaciones}</p>
            </div>
          )}

          {/* Precio */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Información de Precio</h3>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tarifa Antes de Impuestos:</span>
              <span className="text-lg font-bold text-gray-900">${precioTotal.toLocaleString('es-CO')} COP</span>
            </div>
          </div>

          {/* Estado */}
          <div className="mt-6">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Estado:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                reserva.activa === false 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {reserva.activa === false ? 'Cancelada' : 'Activa'}
              </span>
            </div>
            
            {reserva.activa === false && (
              <div className="mt-2 text-sm text-gray-600">
                <p>Cancelada por: {reserva.borrado_por || 'Sistema'}</p>
                <p>Fecha de cancelación: {
                  reserva.fecha_cancelacion 
                    ? new Date(reserva.fecha_cancelacion).toLocaleDateString('es-ES') 
                    : 'N/A'
                }</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReservasContent() {
  const { user, loading, isAuthenticated } = useAuthRedirect();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loadingReservas, setLoadingReservas] = useState(true);
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'cancelled'>('all');
  const itemsPerPage = 10;

  // Debounce para el término de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 1000); // 1 segundo de delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Cargar reservas
  const loadReservas = async (page: number = 1) => {
    try {
      setLoadingReservas(true);
      
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      let query = supabase
        .from('informs')
        .select('*', { count: 'exact' })
        .order('fecha_creacion', { ascending: false })
        .range(from, to);

      // Aplicar filtros
      if (debouncedSearchTerm) {
        query = query.or(`apellidos_y_nombres_paciente.ilike.%${debouncedSearchTerm}%,numero_autorizacion.ilike.%${debouncedSearchTerm}%,apellidos_y_nombres_acompañante.ilike.%${debouncedSearchTerm}%`);
      }

      if (filterStatus === 'active') {
        query = query.eq('activa', true);
      } else if (filterStatus === 'cancelled') {
        query = query.eq('activa', false);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error loading reservas:', error);
        return;
      }

      setReservas(data || []);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
      
      // Mostrar toast de éxito si hay datos
      if (data && data.length > 0) {
        toast.success(`${data.length} reserva${data.length !== 1 ? 's' : ''} cargada${data.length !== 1 ? 's' : ''}`, {
          duration: 2000,
          style: {
            background: '#10B981',
            color: '#fff',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500',
          },
          icon: '📋',
        });
      }
    } catch (error) {
      console.error('Error loading reservas:', error);
      toast.error('Error al cargar las reservas', {
        duration: 4000,
        style: {
          background: '#EF4444',
          color: '#fff',
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
        },
        icon: '❌',
      });
    } finally {
      setLoadingReservas(false);
    }
  };

  // Cancelar reserva
  const cancelarReserva = async (id: string) => {
    try {
      const { error } = await supabase
        .from('informs')
        .update({ 
          activa: false,
          borrado_por: user?.email || 'Sistema',
          fecha_cancelacion: new Date().toISOString()
        })
        .eq('numero_autorizacion', id);

      if (error) {
        console.error('Error cancelling reserva:', error);
        toast.error('Error al cancelar la reserva');
        return;
      }

      // Recargar la lista
      loadReservas(currentPage);
      toast.success('Reserva cancelada exitosamente', {
        duration: 4000,
        style: {
          background: '#10B981',
          color: '#fff',
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
        },
        icon: '✅',
      });
    } catch (error) {
      console.error('Error cancelling reserva:', error);
      toast.error('Error al cancelar la reserva', {
        duration: 4000,
        style: {
          background: '#EF4444',
          color: '#fff',
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
        },
        icon: '❌',
      });
    }
  };

  // Ver detalles
  const verDetalles = (reserva: Reserva) => {
    setSelectedReserva(reserva);
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadReservas(currentPage);
    }
  }, [isAuthenticated, currentPage, debouncedSearchTerm, filterStatus]);

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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso requerido</h1>
          <p className="text-gray-600">Debes iniciar sesión para ver las reservas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Reservas</h1>
          <p className="text-gray-600">Administra todas las reservas del sistema</p>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
                {searchTerm && searchTerm !== debouncedSearchTerm && (
                  <span className="ml-2 text-xs text-teal-600 font-normal">
                    🔍 Buscando...
                  </span>
                )}
              </label>
              <input
                type="text"
                placeholder="Nombre, autorización o acompañante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'cancelled')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="all">Todas</option>
                <option value="active">Activas</option>
                <option value="cancelled">Canceladas</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => loadReservas(currentPage)}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                Buscar
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de reservas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loadingReservas ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando reservas...</p>
            </div>
          ) : reservas.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No se encontraron reservas</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Paciente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Autorización
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hotel
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fechas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Creado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reservas.map((reserva) => (
                      <tr key={reserva.numero_autorizacion} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {reserva.apellidos_y_nombres_paciente}
                            </div>
                            <div className="text-sm text-gray-500">
                              {reserva.tipo_documento_paciente} {reserva.numero_documento_paciente}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-mono">
                            {reserva.numero_autorizacion}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {reserva.hotel_asignado || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {reserva.fecha_check_in && reserva.fecha_check_out ? (
                              <>
                                <div>{new Date(reserva.fecha_check_in).toLocaleDateString('es-ES')}</div>
                                <div className="text-gray-500">→ {new Date(reserva.fecha_check_out).toLocaleDateString('es-ES')}</div>
                              </>
                            ) : (
                              'N/A'
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            reserva.activa === false 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {reserva.activa === false ? 'Cancelada' : 'Activa'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {reserva.fecha_creacion ? new Date(reserva.fecha_creacion).toLocaleDateString('es-ES') : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => verDetalles(reserva)}
                              className="text-teal-600 hover:text-teal-900 transition-colors"
                            >
                              Ver Detalles
                            </button>
                            {reserva.activa !== false && (
                              <button
                                onClick={() => {
                                  if (confirm('¿Estás seguro de que quieres cancelar esta reserva?')) {
                                    cancelarReserva(reserva.numero_autorizacion);
                                  }
                                }}
                                className="text-red-600 hover:text-red-900 transition-colors"
                              >
                                Cancelar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Página <span className="font-medium">{currentPage}</span> de{' '}
                        <span className="font-medium">{totalPages}</span>
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Anterior</span>
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const page = i + 1;
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === page
                                  ? 'z-10 bg-teal-50 border-teal-500 text-teal-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                        
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Siguiente</span>
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de detalles */}
      <ReservaModal
        reserva={selectedReserva}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedReserva(null);
        }}
      />

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500',
          },
        }}
      />
    </div>
  );
}

export default function ReservasPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <ReservasContent />
    </Suspense>
  );
}
