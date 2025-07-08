
export interface Transacao {
  id: number
  created_at: string
  quando: string | null
  estabelecimento: string | null
  valor: number | null
  detalhes: string | null
  tipo: string | null
  category_id: string
  userId: string // Removido null - agora é obrigatório
  categorias?: {
    id: string
    nome: string
  }
}

export interface TransactionFormData {
  quando: string
  estabelecimento: string
  valor: number
  detalhes: string
  tipo: string
  category_id: string
}
