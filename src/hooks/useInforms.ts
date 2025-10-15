import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface InformRecord {
  numero_autorizacion: string
  tipo_documento_paciente: string
  numero_documento_paciente: number
  apellidos_y_nombres_paciente: string
  edad_paciente: number
  regimen: string
  descripcion_servicio: string
  destino: string
  cantidad_servicios_autorizados: number
  numero_contacto: number
  requiere_acompañante: boolean
  tipo_documento_acompañante: string
  numero_documento_: string
  apellidos_y_nombres_acompañante: string
  parentesco_acompañante: string
  fecha_cita: string
  hora_cita: string
  fecha_ultima_cita: string
  hora_ultima_cita: string
  POS: boolean
  MIPRES: string
  fecha_check_in: string
  fecha_check_out: string
  correo: string
  hotel_asignado: string
  observaciones: string
}

export function useInforms() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createInforms = async (records: InformRecord[]) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('informs')
        .insert(records)

      if (error) {
        throw error
      }

      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const createSingleInform = async (record: InformRecord) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('informs')
        .insert([record])
        .select()

      if (error) {
        throw error
      }

      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  return {
    createInforms,
    createSingleInform,
    loading,
    error
  }
}
