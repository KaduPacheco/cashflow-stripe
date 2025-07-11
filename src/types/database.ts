// Tipos baseados exatamente no schema do Supabase
export interface DatabaseTransaction {
  id?: number
  estabelecimento?: string | null
  valor?: number | null
  tipo?: string | null
  category_id: string
  detalhes?: string | null
  quando?: string | null
  userId?: string | null
  created_at?: string
}

export interface DatabaseCategory {
  id?: string
  userid: string
  nome: string
  tags?: string | null
  created_at?: string
  updated_at?: string
}

export interface DatabaseClienteFornecedor {
  id?: string
  user_id: string
  nome: string
  tipo?: 'cliente' | 'fornecedor' | 'ambos'
  documento?: string | null
  email?: string | null
  telefone?: string | null
  endereco?: string | null
  observacoes?: string | null
  ativo?: boolean
  created_at?: string
  updated_at?: string
}