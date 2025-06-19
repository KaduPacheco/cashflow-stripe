
export interface ClienteFornecedor {
  id: string
  user_id: string
  nome: string
  tipo: 'cliente' | 'fornecedor' | 'ambos'
  documento?: string
  email?: string
  telefone?: string
  endereco?: string
  observacoes?: string
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface ContaPagarReceber {
  id: string
  user_id: string
  tipo: 'pagar' | 'receber'
  descricao: string
  valor: number
  data_vencimento: string
  data_pagamento?: string
  valor_pago: number
  status: 'pendente' | 'pago' | 'parcialmente_pago' | 'vencido' | 'cancelado'
  category_id?: string
  cliente_fornecedor_id?: string
  observacoes?: string
  numero_documento?: string
  recorrencia?: 'unica' | 'mensal' | 'trimestral' | 'semestral' | 'anual'
  data_proxima_recorrencia?: string
  conta_origem_id?: string
  created_at: string
  updated_at: string
  categorias?: {
    id: string
    nome: string
  }
  clientes_fornecedores?: ClienteFornecedor
}

export interface ContasStats {
  totalAPagar: number
  totalAReceber: number
  totalVencidas: number
  totalPagasNoMes: number
  saldoProjetado: number
}

export interface ContasFilters {
  tipo?: 'pagar' | 'receber'
  status?: string
  data_inicio?: string
  data_fim?: string
  categoria?: string
  cliente_fornecedor?: string
  busca?: string
  recorrencia?: string
}
