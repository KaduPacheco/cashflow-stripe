
export interface Lembrete {
  id: number
  created_at: string
  userId: string | null
  descricao: string | null
  data: string | null
  valor: number | null
  whatsapp: string | null
  notificar_whatsapp: boolean | null
  data_envio_whatsapp: string | null
  horario_envio_whatsapp: string | null
  whatsapp_notification_sent?: boolean | null
}

export interface LembreteFormData {
  descricao: string
  data: string
  valor: string
  notificar_whatsapp: boolean
  data_envio_whatsapp: string
  horario_envio_whatsapp: string
}
