import { TablesInsert } from '@/types/supabase'

// Mapeo de columnas de entrada a campos de la tabla informs
export const COLUMN_MAPPING = {
  'TIPO DOCUMENTO PACIENTE': 'tipo_documento_paciente',
  'NÚMERO DOCUMENTO PACIENTE': 'numero_documento_paciente', 
  'APELLIDOS Y NOMBRES PACIENTE': 'apellidos_y_nombres_paciente',
  'EDAD PACIENTE': 'edad_paciente',
  'REGIMEN': 'regimen',
  'DESCRIPCION DEL SERVICIO': 'descripcion_servicio',
  'DESTINO': 'destino',
  'No. DE AUTORIZACION': 'numero_autorizacion',
  'No DE AUTORIZACION': 'numero_autorizacion',
  'CANTIDAD SERVICIOS AUTORIZADOS': 'cantidad_servicios_autorizados',
  'NÚMERO DE CONTACTO': 'numero_contacto',
  'REQUIERE ACOMPAÑANTE': 'requiere_acompañante',
  'TIPO IDENTIFICACION ACOMPAÑANTE': 'tipo_documento_acompañante',
  'NÚMERO IDENTIFICACION ACOMPAÑANTE': 'numero_documento_',
  'APELLIDOS Y NOMBRES': 'apellidos_y_nombres_acompañante',
  'APELLIDOS Y NOMBRES PACIENTE': 'apellidos_y_nombres_paciente',
  'PARENTESCO ACOMPAÑANTE': 'parentesco_acompañante',
  'FECHA DE CITA': 'fecha_cita',
  'HORA CITA': 'hora_cita',
  'FECHA DE ULTIMA CITA': 'fecha_ultima_cita',
  'HORA ÚLTIMA CITA': 'hora_ultima_cita',
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
  headers: string[]
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
    const transformedRow: TablesInsert<'informs'> = {}
    
    // Mapear cada campo
    Object.entries(columnIndices).forEach(([fieldName, columnIndex]) => {
      const value = row[columnIndex]?.trim()
      
      // Siempre asignar el valor, incluso si está vacío
      // Convertir tipos según el campo
      switch (fieldName) {
        case 'edad_paciente':
        case 'cantidad_servicios_autorizados':
        case 'numero_contacto':
        case 'numero_documento_paciente':
          if (value && value !== '') {
            const numValue = parseInt(value)
            if (!isNaN(numValue)) {
              transformedRow[fieldName as keyof TablesInsert<'informs'>] = numValue
            }
          } else {
            transformedRow[fieldName as keyof TablesInsert<'informs'>] = null
          }
          break
          
        case 'requiere_acompañante':
        case 'POS':
          if (value && value !== '') {
            const boolValue = value.toLowerCase() === 'si' || value.toLowerCase() === 'yes' || value === '1'
            transformedRow[fieldName as keyof TablesInsert<'informs'>] = boolValue
          } else {
            transformedRow[fieldName as keyof TablesInsert<'informs'>] = null
          }
          break
          
        case 'fecha_cita':
        case 'fecha_ultima_cita':
        case 'fecha_check_in':
        case 'fecha_check_out':
          if (value && value !== '') {
            // Convertir fecha al formato ISO para la base de datos
            const isoDate = convertToISODate(value)
            if (isoDate) {
              transformedRow[fieldName as keyof TablesInsert<'informs'>] = isoDate
            } else {
              transformedRow[fieldName as keyof TablesInsert<'informs'>] = value
            }
          } else {
            transformedRow[fieldName as keyof TablesInsert<'informs'>] = null
          }
          break
          
        default:
          transformedRow[fieldName as keyof TablesInsert<'informs'>] = value || null
          break
      }
    })
    
    // Validar que tenga al menos el número de autorización (campo requerido)
    // Verificar si tiene número de autorización
    // console.log(`Registro ${rowIndex + 1} - numero_autorizacion:`, transformedRow.numero_autorizacion)
    // console.log(`Registro ${rowIndex + 1} - datos completos:`, transformedRow)
    
    if (transformedRow.numero_autorizacion) {
      transformedData.push(transformedRow)
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
    
    if (row.edad_paciente && (row.edad_paciente < 0 || row.edad_paciente > 120)) {
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

// Función para convertir fechas al formato ISO
function convertToISODate(dateString: string): string | null {
  if (!dateString || dateString.trim() === '') return null
  
  try {
    // Manejar diferentes formatos de fecha
    let date: Date
    
    // Formato DD/MM/YYYY
    if (dateString.includes('/')) {
      const parts = dateString.split('/')
      if (parts.length === 3) {
        const day = parseInt(parts[0])
        const month = parseInt(parts[1]) - 1 // Los meses en JS van de 0-11
        const year = parseInt(parts[2])
        
        // Validar que la fecha sea válida
        if (day < 1 || day > 31 || month < 0 || month > 11 || year < 1900) {
          return null
        }
        
        date = new Date(year, month, day)
        
        // Verificar que la fecha creada sea válida (maneja casos como 31/09)
        if (date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year) {
          return null
        }
      } else {
        return null
      }
    }
    // Formato MM/DD/YYYY
    else if (dateString.includes('/') && dateString.split('/')[0].length <= 2) {
      const parts = dateString.split('/')
      if (parts.length === 3) {
        const month = parseInt(parts[0]) - 1
        const day = parseInt(parts[1])
        const year = parseInt(parts[2])
        
        if (day < 1 || day > 31 || month < 0 || month > 11 || year < 1900) {
          return null
        }
        
        date = new Date(year, month, day)
        
        if (date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year) {
          return null
        }
      } else {
        return null
      }
    }
    // Formato YYYY-MM-DD
    else if (dateString.includes('-')) {
      date = new Date(dateString)
    }
    // Otros formatos
    else {
      date = new Date(dateString)
    }
    
    // Verificar que la fecha sea válida
    if (isNaN(date.getTime())) {
      return null
    }
    
    // Retornar en formato ISO
    return date.toISOString()
  } catch (error) {
    return null
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
