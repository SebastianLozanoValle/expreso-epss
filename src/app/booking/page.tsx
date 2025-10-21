'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { supabase } from '@/lib/supabase';
import { TablesInsert } from '@/types/supabase';

export default function BookingPage() {
  const searchParams = useSearchParams();
  const { user, loading, isAuthenticated } = useAuthRedirect();
  const [formData, setFormData] = useState<{[key: string]: {[key: string]: string | number | boolean}}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [rooms, setRooms] = useState<any[]>([]);
  const [checkIn, setCheckIn] = useState<string>('');
  const [checkOut, setCheckOut] = useState<string>('');
  const [city, setCity] = useState<string>('');

  // Extraer parámetros de la URL
  useEffect(() => {
    const checkInParam = searchParams.get('checkIn');
    const checkOutParam = searchParams.get('checkOut');
    const cityParam = searchParams.get('city');
    const adultsParam = searchParams.get('adults') || '1';
    const childrenParam = searchParams.get('children') || '0';
    const babiesParam = searchParams.get('babies') || '0';
    
    if (checkInParam && checkOutParam && cityParam) {
      setCheckIn(checkInParam);
      setCheckOut(checkOutParam);
      setCity(cityParam);
      
      // Calcular precio según la ciudad y cantidad de huéspedes
      let basePrice = 0;
      if (cityParam === 'Bogotá') {
        basePrice = 133256; // Precio base Bogotá
      } else if (cityParam === 'Medellín') {
        basePrice = 163841; // Precio base Medellín
      } else if (cityParam === 'Cali') {
        basePrice = 182011; // Precio base Cali
      }
      
      // Calcular precio según cantidad de huéspedes
      const totalGuests = parseInt(adultsParam) + parseInt(childrenParam) + parseInt(babiesParam);
      let finalPrice = basePrice;
      
      if (totalGuests === 1) {
        finalPrice = basePrice; // Solo usuario
      } else if (totalGuests === 2) {
        finalPrice = Math.round(basePrice * 1.5); // Usuario + acompañante
      } else if (totalGuests >= 3) {
        finalPrice = basePrice * 2; // Usuario + 2+ acompañantes
      }
      
      // Crear habitación virtual con los parámetros
      const virtualRoom = {
        id: 'virtual-room',
        name: `Habitación - ${cityParam}`,
        price: finalPrice,
        guestConfig: {
          adults: parseInt(adultsParam),
          children: parseInt(childrenParam),
          babies: parseInt(babiesParam),
          checkIn: checkInParam,
          checkOut: checkOutParam
        }
      };
      
      setRooms([virtualRoom]);
    }
  }, [searchParams]);

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
          <p className="text-gray-600">Debes iniciar sesión para continuar con la reserva.</p>
        </div>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Parámetros requeridos</h1>
          <p className="text-gray-600">Esta página requiere los parámetros: checkIn, checkOut y city.</p>
          <p className="text-gray-500 mt-2">Ejemplo: /booking?checkIn=2025-11-27&checkOut=2025-11-29&city=Bogotá</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (roomId: string, field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        [field]: value
      }
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[`${roomId}_${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${roomId}_${field}`];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    rooms.forEach(room => {
      const roomData = formData[room.id] || {};
      
      // Campos obligatorios
      const requiredFields = [
        'tipo_documento_paciente',
        'numero_documento_paciente', 
        'apellidos_y_nombres_paciente',
        'edad_paciente',
        'regimen',
        'descripcion_servicio',
        'numero_autorizacion',
        'fecha_cita'
      ];
      
      requiredFields.forEach(field => {
        if (!roomData[field] || roomData[field].toString().trim() === '') {
          newErrors[`${room.id}_${field}`] = 'Este campo es obligatorio';
        }
      });
      
      // Validar email si se proporciona
      if (roomData.correo && typeof roomData.correo === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(roomData.correo)) {
        newErrors[`${room.id}_correo`] = 'Ingresa un email válido';
      }
      
      // Validar edad
      if (roomData.edad_paciente && typeof roomData.edad_paciente === 'number' && (isNaN(roomData.edad_paciente) || roomData.edad_paciente < 0 || roomData.edad_paciente > 120)) {
        newErrors[`${room.id}_edad_paciente`] = 'Ingresa una edad válida (0-120 años)';
      }
      
      // Si requiere acompañante, validar campos del acompañante
      if (roomData.requiere_acompañante) {
        const accompanimentFields = [
          'tipo_documento_acompañante',
          'numero_documento_acompañante',
          'apellidos_y_nombres_acompañante',
          'parentesco_acompañante'
        ];
        
        accompanimentFields.forEach(field => {
          if (!roomData[field] || roomData[field].toString().trim() === '') {
            newErrors[`${room.id}_${field}`] = 'Este campo es obligatorio cuando se requiere acompañante';
          }
        });
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    
    // Validar formulario
    if (!validateForm()) {
      alert('Por favor, completa todos los campos obligatorios correctamente');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Preparar datos para enviar a Supabase
      const dataToInsert: TablesInsert<'informs'>[] = [];
      
      rooms.forEach(room => {
        const roomData = formData[room.id] || {};
        
        // Usar la ciudad de los parámetros de la URL
        const cityFromParams = city || 'Bogotá';
        
        // Asignar hotel según la ciudad
        let hotelAsignado = '';
        if (cityFromParams === 'Bogotá') {
          hotelAsignado = 'Ilar 74';
        } else if (cityFromParams === 'Medellín') {
          hotelAsignado = 'Saana 45';
        } else if (cityFromParams === 'Cali') {
          hotelAsignado = 'Bulevar del Rio';
        }
        
        // Usar las fechas de los parámetros de la URL
        const fechaCheckIn = checkIn || null;
        const fechaCheckOut = checkOut || null;
        
        // Crear objeto con solo los campos que tienen valor
        const insertData: TablesInsert<'informs'> = {
          // Campo obligatorio: user_id del usuario logueado
          user_id: user?.id,
          
          // Campos obligatorios
          tipo_documento_paciente: String(roomData.tipo_documento_paciente || ''),
          numero_documento_paciente: String(roomData.numero_documento_paciente || ''),
          apellidos_y_nombres_paciente: String(roomData.apellidos_y_nombres_paciente || ''),
          edad_paciente: typeof roomData.edad_paciente === 'number' ? roomData.edad_paciente : parseInt(String(roomData.edad_paciente)) || null,
          regimen: String(roomData.regimen || ''),
          descripcion_servicio: 'Habitación Estándar', // Siempre habitación estándar
          destino: cityFromParams, // Usar ciudad de los parámetros de la URL
          numero_autorizacion: String(roomData.numero_autorizacion || ''),
          fecha_cita: String(roomData.fecha_cita || ''),
          
          // Campos opcionales
          cantidad_servicios_autorizados: 1, // Siempre 1 habitación autorizada
          numero_contacto: typeof roomData.numero_contacto === 'number' ? roomData.numero_contacto : (roomData.numero_contacto ? parseInt(String(roomData.numero_contacto)) : null),
          correo: String(roomData.correo || '') || null,
          hora_cita: String(roomData.hora_cita || '') || null,
          fecha_check_in: fechaCheckIn, // Fechas reales del room.guestConfig
          fecha_check_out: fechaCheckOut, // Fechas reales del room.guestConfig
          hotel_asignado: hotelAsignado, // Asignar hotel automáticamente según ciudad
          observaciones: String(roomData.observaciones || '') || null,
          requiere_acompañante: Boolean(roomData.requiere_acompañante),
          
          // Campos del acompañante (solo si se requiere)
          tipo_documento_acompañante: roomData.requiere_acompañante ? String(roomData.tipo_documento_acompañante || '') : null,
          numero_documento_acompañante: roomData.requiere_acompañante ? String(roomData.numero_documento_acompañante || '') : null,
          apellidos_y_nombres_acompañante: roomData.requiere_acompañante ? String(roomData.apellidos_y_nombres_acompañante || '') : null,
          parentesco_acompañante: roomData.requiere_acompañante ? String(roomData.parentesco_acompañante || '') : null,
        };
        
        dataToInsert.push(insertData);
      });
      
      // Enviar a Supabase
      const { error } = await supabase
        .from('informs')
        .insert(dataToInsert);
      
      if (error) {
        throw error;
      }
      
      // Enviar correo de confirmación para cada reserva
      for (const reservation of dataToInsert) {
        try {
          const emailResponse = await fetch('/api/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: user?.email || 'sebdevcol@gmail.com', // Usar email del usuario logueado
              patientName: reservation.apellidos_y_nombres_paciente,
              numeroAutorizacion: reservation.numero_autorizacion
            }),
          });
          
          if (!emailResponse.ok) {
            console.error('Error enviando correo para reserva:', reservation.numero_autorizacion);
          } else {
            console.log('Correo enviado exitosamente para reserva:', reservation.numero_autorizacion);
          }
        } catch (emailError) {
          console.error('Error enviando correo:', emailError);
        }
      }
      
      setSuccessMessage(`¡Reserva realizada exitosamente! Se han registrado ${dataToInsert.length} reserva${dataToInsert.length !== 1 ? 's' : ''} y se han enviado los correos de confirmación.`);
      
      // Limpiar formulario después del éxito
      setFormData({});
      
    } catch (error) {
      console.error('Error al procesar la reserva:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al procesar la reserva: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen bg-gray-50 overflow-y-auto">
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Completar Reserva</h1>
          <p className="text-gray-600">Proporciona la información requerida para cada habitación</p>
          
          {/* Mostrar información de la reserva */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-900">Ciudad:</span>
                <span className="ml-2 text-blue-700">{city}</span>
              </div>
              <div>
                <span className="font-medium text-blue-900">Check-in:</span>
                <span className="ml-2 text-blue-700">{checkIn}</span>
              </div>
              <div>
                <span className="font-medium text-blue-900">Check-out:</span>
                <span className="ml-2 text-blue-700">{checkOut}</span>
              </div>
              <div>
                <span className="font-medium text-blue-900">Huéspedes:</span>
                <span className="ml-2 text-blue-700">
                  {rooms[0]?.guestConfig ? 
                    `${rooms[0].guestConfig.adults + rooms[0].guestConfig.children + rooms[0].guestConfig.babies} persona(s)` : 
                    'N/A'
                  }
                </span>
              </div>
            </div>
          </div>
          
          {successMessage && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-green-800 font-medium">{successMessage}</p>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {rooms.map((room, index) => (
            <RoomForm 
              key={room.id}
              room={room}
              roomIndex={index}
              formData={formData[room.id] || {}}
              onInputChange={(field, value) => handleInputChange(room.id, field, value)}
              errors={errors}
            />
          ))}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" style={{maxHeight: '75vh', overflowY: 'auto'}}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Total de la Reserva</h3>
                <p className="text-sm text-gray-600">
                  {rooms.length} habitación{rooms.length !== 1 ? 'es' : ''} • 
                  {rooms.reduce((total, room) => {
                    const roomGuests = room.guestConfig 
                      ? room.guestConfig.adults + room.guestConfig.children + room.guestConfig.babies
                      : 2;
                    return total + roomGuests;
                  }, 0)} huésped{rooms.reduce((total, room) => {
                    const roomGuests = room.guestConfig 
                      ? room.guestConfig.adults + room.guestConfig.children + room.guestConfig.babies
                      : 2;
                    return total + roomGuests;
                  }, 0) !== 1 ? 'es' : ''}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {rooms.reduce((total, room) => total + room.price, 0).toLocaleString('es-CO')} COP
                </div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isSubmitting ? 'Procesando...' : 'Confirmar Reserva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface RoomFormProps {
  room: { id: string; name: string; price: number };
  roomIndex: number;
  formData: {[key: string]: string | number | boolean};
  onInputChange: (field: string, value: string | number | boolean) => void;
  errors: {[key: string]: string};
}

function RoomForm({ room, roomIndex, formData, onInputChange, errors }: RoomFormProps) {
  // Función para obtener clases de input con mejor contraste
  const getInputClassName = (fieldName: string) => {
    const baseClasses = "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900";
    const errorClasses = errors[`${room.id}_${fieldName}`] 
      ? 'border-red-500 bg-red-50' 
      : 'border-gray-400 hover:border-gray-500';
    return `${baseClasses} ${errorClasses}`;
  };
  const [isAccompanimentExpanded, setIsAccompanimentExpanded] = useState(false);
  
  const getFieldError = (field: string) => errors[`${room.id}_${field}`];
  

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header del acordeón */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
              {roomIndex + 1}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
              <p className="text-sm text-gray-600">
                {room.guestConfig ? 
                  `${room.guestConfig.adults + room.guestConfig.children + room.guestConfig.babies} huésped${(room.guestConfig.adults + room.guestConfig.children + room.guestConfig.babies) !== 1 ? 'es' : ''}` : 
                  '1 huésped'
                }
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-900">
              {room.price.toLocaleString('es-CO')} COP
            </div>
            <div className="text-sm text-gray-600">por noche</div>
          </div>
        </div>
      </div>

      {/* Contenido del acordeón */}
      <div className="p-6 space-y-6">
        {/* Información Principal del Paciente */}
        <div>
          <h4 className="text-md font-semibold text-gray-900 mb-4">Información del Paciente</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Documento *
              </label>
              <div className="relative">
                <select
                  value={String(formData.tipo_documento_paciente || '')}
                  onChange={(e) => onInputChange('tipo_documento_paciente', e.target.value)}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none bg-white text-gray-900 ${
                    errors[`${room.id}_tipo_documento_paciente`] 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-400 hover:border-gray-500'
                  }`}
                  required
                >
                  <option value="" disabled className="text-gray-500">Seleccionar...</option>
                  <option value="CC" className="text-gray-900">Cédula de Ciudadanía</option>
                  <option value="TI" className="text-gray-900">Tarjeta de Identidad</option>
                  <option value="CE" className="text-gray-900">Cédula de Extranjería</option>
                  <option value="PA" className="text-gray-900">Pasaporte</option>
                </select>
                {/* Icono de dropdown personalizado */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {errors[`${room.id}_tipo_documento_paciente`] && (
                <p className="mt-1 text-sm text-red-600">{errors[`${room.id}_tipo_documento_paciente`]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Documento *
              </label>
              <input
                type="text"
                value={String(formData.numero_documento_paciente || '')}
                onChange={(e) => onInputChange('numero_documento_paciente', e.target.value)}
                className={getInputClassName('numero_documento_paciente')}
                required
              />
              {getFieldError('numero_documento_paciente') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('numero_documento_paciente')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombres y Apellidos *
              </label>
              <input
                type="text"
                value={String(formData.apellidos_y_nombres_paciente || '')}
                onChange={(e) => onInputChange('apellidos_y_nombres_paciente', e.target.value)}
                className={getInputClassName('apellidos_y_nombres_paciente')}
                required
              />
              {getFieldError('apellidos_y_nombres_paciente') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('apellidos_y_nombres_paciente')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Edad *
              </label>
              <input
                type="number"
                value={String(formData.edad_paciente || '')}
                onChange={(e) => onInputChange('edad_paciente', e.target.value)}
                className={getInputClassName('edad_paciente')}
                required
                min="0"
                max="120"
              />
              {getFieldError('edad_paciente') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('edad_paciente')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Régimen *
              </label>
              <select
                value={String(formData.regimen || '')}
                onChange={(e) => onInputChange('regimen', e.target.value)}
                className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 hover:border-gray-500"
                required
              >
                <option value="">Seleccionar...</option>
                <option value="Contributivo">Contributivo</option>
                <option value="Subsidiado">Subsidiado</option>
                <option value="Especial">Especial</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción del Servicio *
              </label>
              <input
                type="text"
                value={String(formData.descripcion_servicio || '')}
                onChange={(e) => onInputChange('descripcion_servicio', e.target.value)}
                className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 hover:border-gray-500"
                required
              />
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Autorización *
              </label>
              <input
                type="text"
                value={String(formData.numero_autorizacion || '')}
                onChange={(e) => onInputChange('numero_autorizacion', e.target.value)}
                className={getInputClassName('numero_autorizacion')}
                required
              />
              {getFieldError('numero_autorizacion') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('numero_autorizacion')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad de Servicios Autorizados
              </label>
              <input
                type="number"
                value={String(formData.cantidad_servicios_autorizados || '')}
                onChange={(e) => onInputChange('cantidad_servicios_autorizados', e.target.value)}
                className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 hover:border-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Contacto
              </label>
              <input
                type="tel"
                value={String(formData.numero_contacto || '')}
                onChange={(e) => onInputChange('numero_contacto', e.target.value)}
                className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 hover:border-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={String(formData.correo || '')}
                onChange={(e) => onInputChange('correo', e.target.value)}
                className={getInputClassName('correo')}
              />
              {getFieldError('correo') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('correo')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Cita *
              </label>
              <input
                type="date"
                value={String(formData.fecha_cita || '')}
                onChange={(e) => onInputChange('fecha_cita', e.target.value)}
                className={getInputClassName('fecha_cita')}
                required
              />
              {getFieldError('fecha_cita') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('fecha_cita')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora de Cita
              </label>
              <input
                type="time"
                value={String(formData.hora_cita || '')}
                onChange={(e) => onInputChange('hora_cita', e.target.value)}
                className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 hover:border-gray-500"
              />
            </div>


            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones
              </label>
              <textarea
                value={String(formData.observaciones || '')}
                onChange={(e) => onInputChange('observaciones', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 hover:border-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Switch para Acompañante */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-md font-semibold text-gray-900">¿Requiere Acompañante?</h4>
              <p className="text-sm text-gray-600">Marca si el paciente requiere acompañante</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(formData.requiere_acompañante)}
                onChange={(e) => {
                  onInputChange('requiere_acompañante', e.target.checked);
                  if (!e.target.checked) {
                    setIsAccompanimentExpanded(false);
                  }
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Formulario de Acompañante (Opcional) */}
        {formData.requiere_acompañante && (
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-semibold text-gray-900">Información del Acompañante</h4>
              <button
                type="button"
                onClick={() => setIsAccompanimentExpanded(!isAccompanimentExpanded)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
              >
                <span className="text-sm font-medium">
                  {isAccompanimentExpanded ? 'Ocultar' : 'Mostrar'} detalles
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${isAccompanimentExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {isAccompanimentExpanded && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Documento del Acompañante
                  </label>
                  <select
                    value={String(formData.tipo_documento_acompañante || '')}
                    onChange={(e) => onInputChange('tipo_documento_acompañante', e.target.value)}
                    className={getInputClassName('tipo_documento_acompañante')}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="TI">Tarjeta de Identidad</option>
                    <option value="CE">Cédula de Extranjería</option>
                    <option value="PA">Pasaporte</option>
                  </select>
                  {getFieldError('tipo_documento_acompañante') && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('tipo_documento_acompañante')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Documento del Acompañante
                  </label>
                  <input
                    type="text"
                    value={String(formData.numero_documento_acompañante || '')}
                    onChange={(e) => onInputChange('numero_documento_acompañante', e.target.value)}
                    className={getInputClassName('numero_documento_acompañante')}
                  />
                  {getFieldError('numero_documento_acompañante') && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('numero_documento_acompañante')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombres y Apellidos del Acompañante
                  </label>
                  <input
                    type="text"
                    value={String(formData.apellidos_y_nombres_acompañante || '')}
                    onChange={(e) => onInputChange('apellidos_y_nombres_acompañante', e.target.value)}
                    className={getInputClassName('apellidos_y_nombres_acompañante')}
                  />
                  {getFieldError('apellidos_y_nombres_acompañante') && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('apellidos_y_nombres_acompañante')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parentesco con el Acompañante
                  </label>
                  <select
                    value={String(formData.parentesco_acompañante || '')}
                    onChange={(e) => onInputChange('parentesco_acompañante', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 hover:border-gray-500"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Cónyuge">Cónyuge</option>
                    <option value="Hijo(a)">Hijo(a)</option>
                    <option value="Padre/Madre">Padre/Madre</option>
                    <option value="Hermano(a)">Hermano(a)</option>
                    <option value="Otro familiar">Otro familiar</option>
                    <option value="Amigo(a)">Amigo(a)</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}