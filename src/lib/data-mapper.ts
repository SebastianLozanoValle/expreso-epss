import { TablesInsert, Tables } from '@/types/supabase'
import { supabase } from './supabase'

// Mapeo de columnas de entrada a campos de la tabla informs
export const COLUMN_MAPPING = {
  'TIPO DOCUMENTO PACIENTE': 'tipo_documento_paciente',
  'N�MERO DOCUMENTO PACIENTE': 'numero_documento_paciente', 
  'APELLIDOS Y NOMBRES PACIENTE': 'apellidos_y_nombres_paciente',
  'EDAD PACIENTE': 'edad_paciente',
  'REGIMEN': 'regimen',
  'DESCRIPCION DEL SERVICIO': 'descripcion_servicio',
  'DESTINO': 'destino',
  'No. DE AUTORIZACION': 'numero_autorizacion',
  'No DE AUTORIZACION': 'numero_autorizacion',
  'CANTIDAD SERVICIOS AUTORIZADOS': 'cantidad_servicios_autorizados',
  'N�MERO DE CONTACTO': 'numero_contacto',
  'REQUIERE ACOMPA�ANTE': 'requiere_acompañante',
  'TIPO IDENTIFICACION ACOMPA�ANTE': 'tipo_documento_acompañante',
  'N�MERO IDENTIFICACION ACOMPA�ANTE': 'numero_documento_acompañante',
  'APELLIDOS Y NOMBRES': 'apellidos_y_nombres_acompañante',
  'PARENTESCO ACOMPA�ANTE': 'parentesco_acompañante',
  'FECHA DE CITA': 'fecha_cita',
  'HORA CITA': 'hora_cita',
  'FECHA DE ULTIMA CITA': 'fecha_ultima_cita',
  'HORA �LTIMA CITA': 'hora_ultima_cita',
  'POS/NO POS': 'POS',
  'MIPRES': 'MIPRES',
  'FECHA DE CHECK IN': 'fecha_check_in',
  'FECHA DE CHECK OUT': 'fecha_check_out',
  'CORREO': 'correo',
  'HOTEL ASIGNADO': 'hotel_asignado',
  'OBSERVACIONES': 'observaciones'
}

// Función para transformar datos de CSV a formato de tabla informs
export function transformCsvDataToInforms(
  csvData: string[][], 
  headers: string[],
  userEmail?: string
): TablesInsert<'informs'>[] {
  const transformedData: TablesInsert<'informs'>[] = []
  
  // Obtener índices de las columnas mapeadas
  const columnIndices: { [key: string]: number } = {}
  
  // Función para normalizar nombres de columnas
  const normalizeColumnName = (name: string): string => {
    return name
      .trim()
      .toUpperCase()
      .replace(/[ÁÀÄÂ]/g, 'A')
      .replace(/[ÉÈËÊ]/g, 'E')
      .replace(/[ÍÌÏÎ]/g, 'I')
      .replace(/[ÓÒÖÔ]/g, 'O')
      .replace(/[ÚÙÜÛ]/g, 'U')
      .replace(/Ñ/g, 'N')
      .replace(/\s+/g, ' ')
      .trim()
  }

  headers.forEach((header, index) => {
    const normalizedHeader = normalizeColumnName(header)
    let mapped = false
    
    // Buscar coincidencia exacta primero
    if (COLUMN_MAPPING[normalizedHeader as keyof typeof COLUMN_MAPPING]) {
      columnIndices[COLUMN_MAPPING[normalizedHeader as keyof typeof COLUMN_MAPPING]] = index
      mapped = true
    } else {
      // Buscar coincidencia parcial
      for (const [mappingKey, mappingValue] of Object.entries(COLUMN_MAPPING)) {
        if (normalizedHeader.includes(mappingKey) || mappingKey.includes(normalizedHeader)) {
          columnIndices[mappingValue] = index
          mapped = true
          console.log(`Mapeo parcial: "${header}" -> "${mappingKey}" -> "${mappingValue}"`)
          break
        }
      }
    }
    
    if (!mapped) {
      console.log(`Columna no mapeada: "${header}" (normalizada: "${normalizedHeader}")`)
    }
  })
  
  // console.log('Columnas detectadas:', headers.length)
  // console.log('Columnas mapeadas:', Object.keys(columnIndices).length)
  // console.log('Índices de columnas:', columnIndices)
  // console.log('Headers originales:', headers)
  // console.log('Headers normalizados:', headers.map(h => normalizeColumnName(h)))
  
  // Procesar cada fila de datos
  csvData.forEach((row, rowIndex) => {
    const transformedRow: Record<string, any> = {
      // Campo obligatorio: creado_por con email del usuario logueado
      creado_por: userEmail || null,
    }
    
    // Mapear cada campo
    Object.entries(columnIndices).forEach(([fieldName, columnIndex]) => {
      const value = row[columnIndex]?.trim()
      
      // Siempre asignar el valor, incluso si está vacío
      // Convertir tipos según el campo
      switch (fieldName) {
        case 'edad_paciente':
        case 'cantidad_servicios_autorizados':
          // Siempre asignar 1 habitación autorizada
          transformedRow[fieldName] = 1
          break
          
        case 'numero_contacto':
        case 'numero_documento_paciente':
          if (value && value !== '') {
            const numValue = parseInt(value)
            if (!isNaN(numValue)) {
              transformedRow[fieldName] = numValue
            }
          } else {
            transformedRow[fieldName] = null
          }
          break
          
        case 'requiere_acompañante':
        case 'POS':
          if (value && value !== '') {
            const booleanValue = value.toLowerCase() === 'si' || value.toLowerCase() === 'yes' || value === '1';
            transformedRow[fieldName] = booleanValue;
          } else {
            transformedRow[fieldName] = null;
          }
          break;
          
        case 'fecha_cita':
        case 'fecha_ultima_cita':
        case 'fecha_check_in':
        case 'fecha_check_out':
          if (value && value !== '') {
            // CONVERSIÓN OBLIGATORIA - siempre convertir al formato estándar
            const isoDate = convertToISODate(value)
            if (isoDate) {
              transformedRow[fieldName] = isoDate
            } else {
              // Solo mostrar error si NO es un valor esperado como N/A
              if (value.toUpperCase() !== 'N/A' && value.trim() !== '') {
                console.error(`❌ FECHA NO CONVERTIBLE: "${value}" - usando fecha por defecto`)
              }
              transformedRow[fieldName] = null
            }
          } else {
            transformedRow[fieldName] = null
          }
          break
          
        case 'hora_cita':
        case 'hora_ultima_cita':
          if (value && value !== '') {
            // CONVERSIÓN OBLIGATORIA - siempre normalizar formato de hora
            const normalizedTime = normalizeTime(value)
            if (normalizedTime && normalizedTime !== value) {
              console.log(`✅ Hora convertida: "${value}" → "${normalizedTime}"`)
              transformedRow[fieldName] = normalizedTime
            } else if (normalizedTime) {
              transformedRow[fieldName] = normalizedTime
            } else {
              // Solo mostrar error si NO es un valor esperado como N/A
              if (value.toUpperCase() !== 'N/A' && value.trim() !== '') {
                console.error(`❌ HORA NO CONVERTIBLE: "${value}" - usando valor original`)
              }
              transformedRow[fieldName] = value
            }
          } else {
            transformedRow[fieldName] = null
          }
          break
          
        default:
          transformedRow[fieldName] = value || null
          break
      }
    })
    
    // Asignar hotel automáticamente según la ciudad (más flexible)
    const destino = transformedRow.destino?.toLowerCase() || '';
    let hotelAsignado = '';
    
    // Normalizar destino para comparación más flexible
    const destinoNormalizado = destino
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/\s+/g, '')
      .trim();
    
    // Detectar Bogotá con múltiples variaciones
    if (destinoNormalizado.includes('bog') || 
        destinoNormalizado.includes('bogota') || 
        destinoNormalizado.includes('bogotá') ||
        destinoNormalizado.includes('bog') ||
        destinoNormalizado.includes('bogot')) {
      hotelAsignado = 'Ilar 74';
    } 
    // Detectar Medellín con múltiples variaciones
    else if (destinoNormalizado.includes('med') || 
             destinoNormalizado.includes('medellin') || 
             destinoNormalizado.includes('medellín') ||
             destinoNormalizado.includes('medell')) {
      hotelAsignado = 'Saana 45';
    } 
    // Detectar Cali con múltiples variaciones
    else if (destinoNormalizado.includes('cal') || 
             destinoNormalizado.includes('cali') ||
             destinoNormalizado.includes('cal')) {
      hotelAsignado = 'Bulevar del Rio';
    }
    
    // Si se asignó un hotel automáticamente, usarlo; sino mantener el valor original
    if (hotelAsignado) {
      transformedRow.hotel_asignado = hotelAsignado;
    }
    
    // Siempre asignar habitación estándar
    transformedRow.descripcion_servicio = 'Habitación Estándar';
    
    // Validar que tenga al menos el número de autorización (campo requerido)
    // Verificar si tiene número de autorización
    // console.log(`Registro ${rowIndex + 1} - numero_autorizacion:`, transformedRow.numero_autorizacion)
    // console.log(`Registro ${rowIndex + 1} - datos completos:`, transformedRow)
    
    if (transformedRow.numero_autorizacion) {
      transformedData.push(transformedRow as TablesInsert<'informs'>)
      // console.log(`Registro ${rowIndex + 1} transformado:`, transformedRow)
    } else {
      // console.log(`Registro ${rowIndex + 1} omitido - sin número de autorización`)
    }
  })
  
  // console.log('Total registros transformados:', transformedData.length)
  // console.log('Primer registro transformado:', transformedData[0])
  
  return transformedData
}

// Función para validar datos transformados
export function validateTransformedData(data: TablesInsert<'informs'>[]): {
  valid: TablesInsert<'informs'>[]
  invalid: { row: number; errors: string[] }[]
} {
  const valid: TablesInsert<'informs'>[] = []
  const invalid: { row: number; errors: string[] }[] = []
  
  data.forEach((row, index) => {
    const errors: string[] = []
    
    // Validaciones requeridas
    if (!row.numero_autorizacion) {
      errors.push('Número de autorización es requerido')
    }
    
    if (!row.apellidos_y_nombres_paciente) {
      errors.push('Apellidos y nombres del paciente es requerido')
    }
    
    // Validaciones de formato
    if (row.correo && !isValidEmail(row.correo)) {
      errors.push('Formato de correo inválido')
    }
    
    if (row.edad_paciente && (parseInt(row.edad_paciente) < 0 || parseInt(row.edad_paciente) > 120)) {
      errors.push('Edad del paciente debe estar entre 0 y 120 años')
    }
    
    // Validar fechas
    if (row.fecha_cita && !isValidDate(row.fecha_cita)) {
      errors.push('Fecha de cita inválida')
    }
    
    if (row.fecha_check_in && !isValidDate(row.fecha_check_in)) {
      errors.push('Fecha de check-in inválida')
    }
    
    if (row.fecha_check_out && !isValidDate(row.fecha_check_out)) {
      errors.push('Fecha de check-out inválida')
    }
    
    if (errors.length > 0) {
      invalid.push({ row: index + 1, errors })
    } else {
      valid.push(row)
    }
  })
  
  return { valid, invalid }
}

// Función auxiliar para validar email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Función auxiliar para validar fechas
function isValidDate(dateString: string): boolean {
  if (!dateString) return true // Las fechas son opcionales
  
  try {
    const date = new Date(dateString)
    return !isNaN(date.getTime())
  } catch {
    return false
  }
}

// Función para convertir fechas al formato ISO - SIMPLE Y DIRECTO
function convertToISODate(dateString: string): string | null {
  if (!dateString || dateString.trim() === '' || dateString.toUpperCase() === 'N/A') {
    return null;
  }
  
  try {
    // Limpiar la cadena de fecha
    const cleanDateString = dateString.trim().replace(/[^\d\/\-]/g, '');
    
    console.log(`🔄 Convirtiendo fecha: "${dateString}" → "${cleanDateString}"`);
    
    // Solo manejar formatos con slash (M/D/YYYY o MM/DD/YYYY)
    if (cleanDateString.includes('/')) {
      const parts = cleanDateString.split('/');
      if (parts.length === 3) {
        const part1 = parseInt(parts[0]);
        const part2 = parseInt(parts[1]);
        const year = parseInt(parts[2]);
        
        // Determinar si es M/D/YYYY o MM/DD/YYYY basado en el tamaño
        let month, day;
        
        if (part1 > 12) {
          // Es DD/MM/YYYY (día > 12, entonces el primer número es el día)
          day = part1;
          month = part2;
        } else if (part2 > 12) {
          // Es MM/DD/YYYY (mes > 12, entonces el segundo número es el día)
          month = part1;
          day = part2;
        } else {
          // Ambos podrían ser válidos, asumir MM/DD/YYYY (formato americano)
          month = part1;
          day = part2;
        }
        
        console.log(`🔄 Formato detectado: mes=${month}, día=${day}, año=${year}`);
        
        // Validar rangos
        if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > 2100) {
          console.error(`❌ Fecha inválida: mes=${month}, día=${day}, año=${year}`);
          return null;
        }
        
        // Crear fecha (mes - 1 porque JS usa 0-11)
        const date = new Date(year, month - 1, day);
        
        // Verificar que la fecha sea válida
        if (isNaN(date.getTime())) {
          console.error(`❌ Fecha imposible: ${dateString}`);
          return null;
        }
        
        // Retornar en formato YYYY-MM-DD
        const isoDate = date.toISOString().split('T')[0];
        console.log(`✅ Fecha convertida: "${dateString}" → "${isoDate}"`);
        return isoDate;
      }
    }
    
    // Si ya está en formato YYYY-MM-DD, verificar que sea válida
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleanDateString)) {
      const date = new Date(cleanDateString);
      if (!isNaN(date.getTime())) {
        console.log(`✅ Formato YYYY-MM-DD ya correcto: ${cleanDateString}`);
        return cleanDateString;
      }
    }
    
    console.error(`❌ Formato no reconocido: ${dateString}`);
    return null;
    
  } catch (error) {
    console.error(`❌ Error procesando fecha: ${dateString}`, error);
    return null;
  }
}

// Función para normalizar formatos de hora - CONVERSIÓN OBLIGATORIA
function normalizeTime(timeString: string): string | null {
  if (!timeString || timeString.trim() === '' || timeString.toUpperCase() === 'N/A') {
    return null;
  }
  
  try {
    const cleanTime = timeString.trim().toUpperCase();
    console.log(`🔄 Normalizando hora: "${timeString}" → "${cleanTime}"`);
    
    // Formato HH:MM (24 horas) - ya está correcto
    if (/^\d{1,2}:\d{2}$/.test(cleanTime)) {
      const [hours, minutes] = cleanTime.split(':').map(Number);
      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        const normalized = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        console.log(`✅ Formato 24h detectado: ${cleanTime} → ${normalized}`);
        return normalized;
      }
    }
    
    // Formato HH:MM AM/PM (12 horas) - como "11:00 AM"
    if (/^\d{1,2}:\d{2}\s*(AM|PM)$/.test(cleanTime)) {
      const match = cleanTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
      if (match) {
        let hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const period = match[3];
        
        console.log(`🔄 Formato 12h detectado: ${hours}:${minutes} ${period}`);
        
        if (minutes >= 0 && minutes <= 59) {
          if (period === 'AM') {
            if (hours === 12) hours = 0; // 12:xx AM = 00:xx
            if (hours >= 0 && hours <= 11) {
              const normalized = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
              console.log(`✅ AM convertido: ${timeString} → ${normalized}`);
              return normalized;
            }
          } else if (period === 'PM') {
            if (hours === 12) hours = 12; // 12:xx PM = 12:xx
            if (hours >= 1 && hours <= 11) {
              hours += 12; // Convertir a 24 horas
              const normalized = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
              console.log(`✅ PM convertido: ${timeString} → ${normalized}`);
              return normalized;
            }
          }
        }
      }
    }
    
    // Formato HH AM/PM (sin minutos)
    if (/^\d{1,2}\s*(AM|PM)$/.test(cleanTime)) {
      const match = cleanTime.match(/^(\d{1,2})\s*(AM|PM)$/);
      if (match) {
        let hours = parseInt(match[1]);
        const period = match[2];
        
        console.log(`🔄 Formato hora sin minutos detectado: ${hours} ${period}`);
        
        if (period === 'AM') {
          if (hours === 12) hours = 0;
          if (hours >= 0 && hours <= 11) {
            const normalized = `${hours.toString().padStart(2, '0')}:00`;
            console.log(`✅ AM sin minutos convertido: ${timeString} → ${normalized}`);
            return normalized;
          }
        } else if (period === 'PM') {
          if (hours === 12) hours = 12;
          if (hours >= 1 && hours <= 11) {
            hours += 12;
            const normalized = `${hours.toString().padStart(2, '0')}:00`;
            console.log(`✅ PM sin minutos convertido: ${timeString} → ${normalized}`);
            return normalized;
          }
        }
      }
    }
    
    // Solo mostrar error si NO es un valor esperado como N/A
    if (timeString.toUpperCase() !== 'N/A' && timeString.trim() !== '') {
      console.error(`❌ Formato de hora no reconocido: ${timeString}`);
    }
    return timeString; // Retornar el valor original si no se puede normalizar
    
  } catch (error) {
    console.error(`❌ Error procesando hora: ${timeString}`, error);
    return timeString;
  }
}

// Función para generar template CSV con las columnas correctas
export function generateCsvTemplate(): string {
  const headers = Object.keys(COLUMN_MAPPING)
  const sampleData = [
    'CC', '12345678', 'Juan Pérez García', '35', 'Contributivo', 
    'Consulta médica especializada', 'Bogotá', 'AUTH001', '1', 
    '3001234567', 'No', '', '', '', '', '15/01/2024', '10:00', 
    '10/01/2024', '09:00', 'No', 'MIPRES123', '15/01/2024', 
    '16/01/2024', 'juan.perez@email.com', 'Hotel Central', 
    'Paciente con alergias conocidas'
  ]
  
  return [headers.join(','), sampleData.join(',')].join('\n')
}

// Tipos para validación
export interface ValidationResult {
  valid: TablesInsert<'informs'>[]
  rejected: {
    row: number
    data: TablesInsert<'informs'>
    reasons: string[]
    authorizationNumber: string
  }[]
}

// Función para validar datos con verificaciones avanzadas
export async function validateDataWithAdvancedChecks(
  data: TablesInsert<'informs'>[]
): Promise<ValidationResult> {
  const valid: TablesInsert<'informs'>[] = []
  const rejected: ValidationResult['rejected'] = []
  
  // 1. Verificar números de autorización duplicados en el lote actual
  const authorizationNumbers = new Set<string>()
  
  // 2. Verificar números de autorización existentes en la base de datos
  const existingAuthorizations = await getExistingAuthorizationNumbers()
  
  // 3. Verificar disponibilidad de hoteles
  const hotelAvailability = await getHotelAvailabilityData()
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i]
    const reasons: string[] = []
    
    // Validar número de autorización
    if (!row.numero_autorizacion) {
      reasons.push('Número de autorización faltante')
    } else {
      // Verificar duplicados en el lote actual
      if (authorizationNumbers.has(row.numero_autorizacion)) {
        reasons.push('Número de autorización duplicado en el lote actual')
      } else {
        authorizationNumbers.add(row.numero_autorizacion)
        
        // Verificar duplicados en la base de datos
        if (existingAuthorizations.has(row.numero_autorizacion)) {
          reasons.push('Número de autorización ya existe en la base de datos')
        }
      }
    }
    
    // Validar disponibilidad del hotel
    if (row.hotel_asignado && row.fecha_check_in) {
      const hotelAvailability = await checkHotelAvailability(
        row.hotel_asignado,
        row.fecha_check_in,
        row.fecha_check_out || undefined
      )
      
      if (!hotelAvailability.available) {
        reasons.push(`Hotel no disponible: ${hotelAvailability.reason}`)
      }
    }
    
    // Validaciones básicas
    if (!row.apellidos_y_nombres_paciente) {
      reasons.push('Apellidos y nombres del paciente faltante')
    }
    
    if (!row.tipo_documento_paciente) {
      reasons.push('Tipo de documento del paciente faltante')
    }
    
    if (!row.numero_documento_paciente) {
      reasons.push('Número de documento del paciente faltante')
    }
    
    if (reasons.length > 0) {
      rejected.push({
        row: i + 1,
        data: row,
        reasons,
        authorizationNumber: row.numero_autorizacion || 'Sin número'
      })
    } else {
      valid.push(row)
    }
  }
  
  return { valid, rejected }
}

// Función para obtener números de autorización existentes
async function getExistingAuthorizationNumbers(): Promise<Set<string>> {
  try {
    const { data, error } = await supabase
      .from('informs')
      .select('numero_autorizacion')
    
    if (error) {
      console.error('Error al obtener autorizaciones existentes:', error)
      return new Set()
    }
    
    return new Set(data.map(item => item.numero_autorizacion))
  } catch (error) {
    console.error('Error al consultar autorizaciones:', error)
    return new Set()
  }
}

// Función para obtener datos de disponibilidad de hoteles
async function getHotelAvailabilityData(): Promise<Tables<'proyeccion_ocupacion'>[]> {
  try {
    const { data, error } = await supabase
      .from('proyeccion_ocupacion')
      .select('*')
      .order('Fecha', { ascending: true })
    
    if (error) {
      console.error('Error al obtener disponibilidad de hoteles:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Error al consultar disponibilidad:', error)
    return []
  }
}

// Función para verificar disponibilidad de un hotel específico
async function checkHotelAvailability(
  hotelName: string,
  checkInDate: string,
  checkOutDate?: string
): Promise<{ available: boolean; reason: string }> {
  try {
    // Buscar datos de disponibilidad para el hotel y fecha
    const { data, error } = await supabase
      .from('proyeccion_ocupacion')
      .select('*')
      .eq('Hotel', hotelName)
      .eq('Fecha', checkInDate)
    
    if (error) {
      return { available: false, reason: 'Error al consultar disponibilidad' }
    }
    
    if (!data || data.length === 0) {
      return { available: false, reason: 'No hay datos de disponibilidad para este hotel y fecha' }
    }
    
    const availability = data[0]
    
    // Verificar si hay disponibilidad (asumiendo que hay campos de disponibilidad)
    const disponibilidad = availability['Disponibilidad']
    const porcentajeDisponibilidad = availability['% Disponibilidad']
    
    if (disponibilidad === '0' || disponibilidad === '0.00') {
      return { available: false, reason: 'Hotel sin disponibilidad para esta fecha' }
    }
    
    if (porcentajeDisponibilidad && parseFloat(porcentajeDisponibilidad) <= 0) {
      return { available: false, reason: 'Hotel sin disponibilidad (0% disponible)' }
    }
    
    return { available: true, reason: 'Hotel disponible' }
  } catch (error) {
    console.error('Error al verificar disponibilidad:', error)
    return { available: false, reason: 'Error al verificar disponibilidad' }
  }
}

// Función para generar archivo de rechazos en formato JSON
export function generateRejectedDataJson(rejected: ValidationResult['rejected']): string {
  const rejectedData = {
    timestamp: new Date().toISOString(),
    totalRejected: rejected.length,
    rejectedRecords: rejected.map(item => ({
      row: item.row,
      authorizationNumber: item.authorizationNumber,
      reasons: item.reasons,
      patientName: item.data.apellidos_y_nombres_paciente,
      hotel: item.data.hotel_asignado,
      checkInDate: item.data.fecha_check_in,
      checkOutDate: item.data.fecha_check_out
    }))
  }
  
  return JSON.stringify(rejectedData, null, 2)
}

// Función para generar archivo de rechazos en formato CSV
export function generateRejectedDataCsv(rejected: ValidationResult['rejected']): string {
  const headers = [
    'Fila',
    'Numero_Autorizacion',
    'Motivos_Rechazo',
    'Nombre_Paciente',
    'Hotel',
    'Fecha_Check_In',
    'Fecha_Check_Out'
  ]
  
  const rows = rejected.map(item => [
    item.row.toString(),
    item.authorizationNumber,
    item.reasons.join('; '),
    item.data.apellidos_y_nombres_paciente || '',
    item.data.hotel_asignado || '',
    item.data.fecha_check_in || '',
    item.data.fecha_check_out || ''
  ])
  
  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
}
