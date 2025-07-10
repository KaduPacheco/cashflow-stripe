
import type { Transaction, TransactionStats } from './types'

export class TransactionStatsService {
  static calculate(transactions: Transaction[]): TransactionStats {
    const activeTransactions = transactions.filter(t => !t.detalhes?.includes('[ARCHIVED]'))
    
    const totalReceitas = activeTransactions
      .filter(t => t.tipo === 'receita')
      .reduce((sum, t) => sum + (t.valor || 0), 0)
    
    const totalDespesas = activeTransactions
      .filter(t => t.tipo === 'despesa')
      .reduce((sum, t) => sum + (t.valor || 0), 0)
    
    const saldoTotal = totalReceitas - totalDespesas
    
    const transacoesPorCategoria = activeTransactions.reduce((acc, transaction) => {
      const categoryId = transaction.category_id
      if (!acc[categoryId]) {
        acc[categoryId] = { receitas: 0, despesas: 0, total: 0 }
      }
      
      const valor = transaction.valor || 0
      if (transaction.tipo === 'receita') {
        acc[categoryId].receitas += valor
      } else {
        acc[categoryId].despesas += valor
      }
      acc[categoryId].total = acc[categoryId].receitas - acc[categoryId].despesas
      
      return acc
    }, {} as Record<string, { receitas: number; despesas: number; total: number }>)
    
    return {
      totalReceitas,
      totalDespesas,
      saldoTotal,
      transacoesPorCategoria
    }
  }
}
