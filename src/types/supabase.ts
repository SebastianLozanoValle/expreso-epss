export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      informs: {
        Row: {
          activa: boolean
          apellidos_y_nombres_acompañante: string | null
          apellidos_y_nombres_paciente: string | null
          borrado_por: string | null
          cantidad_servicios_autorizados: string | null
          correo: string | null
          descripcion_servicio: string | null
          destino: string | null
          edad_paciente: string | null
          fecha_cancelacion: string | null
          fecha_check_in: string | null
          fecha_check_out: string | null
          fecha_cita: string | null
          fecha_creacion: string
          fecha_ultima_cita: string | null
          hora_cita: string | null
          hora_ultima_cita: string | null
          hotel_asignado: string | null
          MIPRES: string | null
          numero_autorizacion: string
          numero_contacto: string | null
          numero_documento_acompañante: string | null
          numero_documento_paciente: string | null
          observaciones: string | null
          parentesco_acompañante: string | null
          POS: boolean | null
          regimen: string | null
          requiere_acompañante: boolean | null
          tipo_documento_acompañante: string | null
          tipo_documento_paciente: string | null
          user_id: string | null
        }
        Insert: {
          activa?: boolean
          apellidos_y_nombres_acompañante?: string | null
          apellidos_y_nombres_paciente?: string | null
          borrado_por?: string | null
          cantidad_servicios_autorizados?: string | null
          correo?: string | null
          descripcion_servicio?: string | null
          destino?: string | null
          edad_paciente?: string | null
          fecha_cancelacion?: string | null
          fecha_check_in?: string | null
          fecha_check_out?: string | null
          fecha_cita?: string | null
          fecha_creacion?: string
          fecha_ultima_cita?: string | null
          hora_cita?: string | null
          hora_ultima_cita?: string | null
          hotel_asignado?: string | null
          MIPRES?: string | null
          numero_autorizacion: string
          numero_contacto?: string | null
          numero_documento_acompañante?: string | null
          numero_documento_paciente?: string | null
          observaciones?: string | null
          parentesco_acompañante?: string | null
          POS?: boolean | null
          regimen?: string | null
          requiere_acompañante?: boolean | null
          tipo_documento_acompañante?: string | null
          tipo_documento_paciente?: string | null
          user_id?: string | null
        }
        Update: {
          activa?: boolean
          apellidos_y_nombres_acompañante?: string | null
          apellidos_y_nombres_paciente?: string | null
          borrado_por?: string | null
          cantidad_servicios_autorizados?: string | null
          correo?: string | null
          descripcion_servicio?: string | null
          destino?: string | null
          edad_paciente?: string | null
          fecha_cancelacion?: string | null
          fecha_check_in?: string | null
          fecha_check_out?: string | null
          fecha_cita?: string | null
          fecha_creacion?: string
          fecha_ultima_cita?: string | null
          hora_cita?: string | null
          hora_ultima_cita?: string | null
          hotel_asignado?: string | null
          MIPRES?: string | null
          numero_autorizacion?: string
          numero_contacto?: string | null
          numero_documento_acompañante?: string | null
          numero_documento_paciente?: string | null
          observaciones?: string | null
          parentesco_acompañante?: string | null
          POS?: boolean | null
          regimen?: string | null
          requiere_acompañante?: boolean | null
          tipo_documento_acompañante?: string | null
          tipo_documento_paciente?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      proyeccion_ocupacion: {
        Row: {
          "% Disponibilidad": string | null
          "% Ocupacion": string | null
          Bloqueadas: string | null
          "Capacidad instalada PAX": string | null
          Columna1: string | null
          Disponibilidad: string | null
          "Disponibilidad PAX": string | null
          Fecha: string
          Habitaciones: string | null
          Hotel: string
          "Ingresos Corporativo": string | null
          "Ingresos PAX": string | null
          "Ingresos Salud": string | null
          Ocupacion: string | null
          "Ocupacion final": string | null
          "Ocupacion final pax": string | null
          "Ocupacion PAX": string | null
          Prorrogas: string | null
          "Prorrogas PAX": string | null
          "Salidas Corporativo": string | null
          "Salidas PAX": string | null
          "Salidas Salud": string | null
        }
        Insert: {
          "% Disponibilidad"?: string | null
          "% Ocupacion"?: string | null
          Bloqueadas?: string | null
          "Capacidad instalada PAX"?: string | null
          Columna1?: string | null
          Disponibilidad?: string | null
          "Disponibilidad PAX"?: string | null
          Fecha: string
          Habitaciones?: string | null
          Hotel: string
          "Ingresos Corporativo"?: string | null
          "Ingresos PAX"?: string | null
          "Ingresos Salud"?: string | null
          Ocupacion?: string | null
          "Ocupacion final"?: string | null
          "Ocupacion final pax"?: string | null
          "Ocupacion PAX"?: string | null
          Prorrogas?: string | null
          "Prorrogas PAX"?: string | null
          "Salidas Corporativo"?: string | null
          "Salidas PAX"?: string | null
          "Salidas Salud"?: string | null
        }
        Update: {
          "% Disponibilidad"?: string | null
          "% Ocupacion"?: string | null
          Bloqueadas?: string | null
          "Capacidad instalada PAX"?: string | null
          Columna1?: string | null
          Disponibilidad?: string | null
          "Disponibilidad PAX"?: string | null
          Fecha?: string
          Habitaciones?: string | null
          Hotel?: string
          "Ingresos Corporativo"?: string | null
          "Ingresos PAX"?: string | null
          "Ingresos Salud"?: string | null
          Ocupacion?: string | null
          "Ocupacion final"?: string | null
          "Ocupacion final pax"?: string | null
          "Ocupacion PAX"?: string | null
          Prorrogas?: string | null
          "Prorrogas PAX"?: string | null
          "Salidas Corporativo"?: string | null
          "Salidas PAX"?: string | null
          "Salidas Salud"?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
