
export interface Transaction {
  id?: number
  estabelecimento: string
  valor: number
  tipo: 'receita' | 'despesa'
  category_id: string
  detalhes?: string
  quando: string
  userId: string
}

export interface CreateTransactionData {
  estabelecimento: string
  valor: number
  tipo: 'receita' | 'despesa'
  category_id: string
  detalhes?: string
  quando: string
}

export interface UpdateTransactionData extends Partial<CreateTransactionData> {}

export interface TransactionFilters {
  tipo?: 'receita' | 'despesa'
  category_id?: string
  dateFrom?: string
  dateTo?: string
  limit?: number
  offset?: number
}

export interface TransactionStats {
  totalReceitas: number
  totalDespesas: number
  saldo: number
  totalTransactions: number
}
