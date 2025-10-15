import { InformRecord } from '@/hooks/useInforms'

// Mapeo de columnas del CSV a campos de la tabla
const columnMapping: Record<string, keyof InformRecord> = {
  'TIPO DOCUMENTO PACIENTE': 'tipo_documento_paciente',
  'NÚMERO DOCUMENTO PACIENTE': 'numero_documento_paciente',
  'APELLIDOS Y NOMBRES PACIENTE': 'apellidos_y_nombres_paciente',
  'EDAD PACIENTE': 'edad_paciente',
  'REGIMEN': 'regimen',
  'DESCRIPCIÓN DEL SERVICIO': 'descripcion_servicio',
  'DESTINO': 'destino',
  'No. DE AUTORIZACIÓN': 'numero_autorizacion',
  'CANTIDAD SERVICIOS AUTORIZADOS': 'cantidad_servicios_autorizados',
  'NÚMERO DE CONTACTO': 'numero_contacto',
  'REQUIERE ACOMPAÑANTE': 'requiere_acompañante',
  'TIPO IDENTIFICACIÓN ACOMPAÑANTE': 'tipo_documento_acompañante',
  'NÚMERO IDENTIFICACIÓN ACOMPAÑANTE': 'numero_documento_',
  'APELLIDOS Y NOMBRES': 'apellidos_y_nombres_acompañante',
  'PARENTESCO ACOMPAÑANTE': 'parentesco_acompañante',
  'FECHA DE CITA': 'fecha_cita',
  'HORA CITA': 'hora_cita',
  'FECHA DE ÚLTIMA CITA': 'fecha_ultima_cita',
  'HORA ÚLTIMA CITA': 'hora_ultima_cita',
  'POS/NO POS': 'POS',
  'MIPRES': 'MIPRES',
  'FECHA DE CHECK IN': 'fecha_check_in',
  'CORREO': 'correo',
  'HOTEL ASIGNADO': 'hotel_asignado',
  'OBSERVACIONES': 'observaciones'
}

export function mapCsvToInforms(csvData: string[][], headers: string[]): InformRecord[] {
  const records: InformRecord[] = []

  for (let i = 0; i < csvData.length; i++) {
    const row = csvData[i]
    const record: Partial<InformRecord> = {}

    // Mapear cada columna a su campo correspondiente
    for (let j = 0; j < headers.length; j++) {
      const header = headers[j].trim()
      const value = row[j]?.trim() || ''
      const fieldName = columnMapping[header]

      if (fieldName && value) {
        // Convertir tipos de datos según el campo
        switch (fieldName) {
          case 'numero_documento_paciente':
          case 'edad_paciente':
          case 'cantidad_servicios_autorizados':
          case 'numero_contacto':
            record[fieldName] = parseInt(value) || 0
            break
          case 'requiere_acompañante':
          case 'POS':
            record[fieldName] = value.toLowerCase() === 'si' || value.toLowerCase() === 'true' || value === '1'
            break
          case 'fecha_cita':
          case 'fecha_ultima_cita':
          case 'fecha_check_in':
          case 'fecha_check_out':
            // Convertir fecha al formato ISO
            if (value) {
              const date = new Date(value)
              if (!isNaN(date.getTime())) {
                record[fieldName] = date.toISOString().split('T')[0]
              }
            }
            break
          case 'hora_cita':
          case 'hora_ultima_cita':
            // Mantener formato de hora
            record[fieldName] = value
            break
          default:
            record[fieldName] = value
        }
      }
    }

    // Solo agregar el registro si tiene al menos algunos campos básicos
    if (record.apellidos_y_nombres_paciente || record.numero_documento_paciente) {
      records.push(record as InformRecord)
    }
  }

  return records
}

export function getColumnMapping() {
  return columnMapping
}
