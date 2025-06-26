
import { useMemo } from 'react'

interface Transaction {
  id: number
  estabelecimento: string
  valor: number
  tipo: 'receita' | 'despesa'
  category_id: string
  detalhes?: string
  quando: string
  userId: string
  created_at: string
  updated_at: string
}

export function useTransactionStats(transactions: Transaction[]) {
  const stats = useMemo(() => {
    console.log('useTransactionStats: Computing stats for transactions:', transactions?.length || 0)
    
    // Log tipos encontrados para auditoria
    const tiposEncontrados = transactions?.map(t => t.tipo).filter(Boolean)
    console.log('useTransactionStats: Tipos encontrados:', [...new Set(tiposEncontrados)])

    const totalReceita = transactions
      .filter(t => t.tipo?.toLowerCase() === 'receita')
      .reduce((sum, t) => {
        const valor = Number(t.valor) || 0
        console.log('useTransactionStats: Adding receita:', valor, 'from transaction:', t.estabelecimento)
        return sum + valor
      }, 0)

    const totalDespesa = transactions
      .filter(t => t.tipo?.toLowerCase() === 'despesa')
      .reduce((sum, t) => {
        const valor = Number(t.valor) || 0
        console.log('useTransactionStats: Adding despesa:', Math.abs(valor), 'from transaction:', t.estabelecimento)
        return sum + Math.abs(valor)
      }, 0)

    const result = {
      totalReceita,
      totalDespesa,
      transactionCount: transactions.length
    }

    console.log('useTransactionStats: Final stats:', result)
    return result
  }, [transactions])

  return stats
}
