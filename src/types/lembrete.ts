
export interface Lembrete {
  id: number
  created_at: string
  userId: string | null
  descricao: string | null
  data: string | null
  valor: number | null
  whatsapp: string | null
}

export interface LembreteFormData {
  descricao: string
  data: string
  valor: string
}
