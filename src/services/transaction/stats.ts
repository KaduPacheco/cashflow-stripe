
import type { Transacao } from '@/types/transaction'

// Função simplificada para calcular estatísticas de transações
export function calculateTransactionStats(transactions: Transacao[]) {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const stats = {
    totalEntradas: 0,
    totalSaidas: 0,
    saldoMensal: 0,
    transacoesMes: 0,
  }

  transactions.forEach(transaction => {
    if (!transaction.valor || !transaction.quando) return

    const transactionDate = new Date(transaction.quando)
    const isCurrentMonth = transactionDate.getMonth() === currentMonth && 
                          transactionDate.getFullYear() === currentYear

    if (isCurrentMonth) {
      stats.transacoesMes++
      
      if (transaction.tipo === 'entrada') {
        stats.totalEntradas += transaction.valor
      } else if (transaction.tipo === 'saida') {
        stats.totalSaidas += transaction.valor
      }
    }
  })

  stats.saldoMensal = stats.totalEntradas - stats.totalSaidas

  return stats
}
