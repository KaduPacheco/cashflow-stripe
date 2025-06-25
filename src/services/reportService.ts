
import { supabase } from '@/lib/supabase'
import { BUSINESS_RULES } from '@/config/constants'
import type { ReportTransaction, ReportFilters } from '@/hooks/useReports'

export class ReportService {
  static async fetchTransactionsForReport(
    userId: string, 
    filters: ReportFilters
  ): Promise<ReportTransaction[]> {
    let query = supabase
      .from('transacoes')
      .select(`
        *,
        categorias (
          id,
          nome
        )
      `)
      .eq('userId', userId)

    // Apply date filters
    if (filters.startDate) {
      query = query.gte('quando', filters.startDate)
    }
    if (filters.endDate) {
      query = query.lte('quando', filters.endDate)
    }

    // Apply type filter
    if (filters.type && BUSINESS_RULES.TRANSACTION_TYPES.includes(filters.type as any)) {
      query = query.eq('tipo', filters.type)
    }

    // Apply category filter
    if (filters.categoryId) {
      query = query.eq('category_id', filters.categoryId)
    }

    const { data, error } = await query.order('quando', { ascending: false })

    if (error) {
      console.error('Report fetch error:', error)
      throw error
    }

    return data as ReportTransaction[]
  }

  static calculateSummaryData(transactions: ReportTransaction[]) {
    const receitas = transactions
      .filter(t => t.tipo === 'receita')
      .reduce((acc, t) => acc + (t.valor || 0), 0)
    
    const despesas = transactions
      .filter(t => t.tipo === 'despesa')
      .reduce((acc, t) => acc + (t.valor || 0), 0)
    
    const saldo = receitas - despesas

    // Group by category
    const byCategory = transactions.reduce((acc, transaction) => {
      const categoryName = transaction.categorias?.nome || 'Sem categoria'
      const valor = transaction.valor || 0
      
      if (!acc[categoryName]) {
        acc[categoryName] = { receitas: 0, despesas: 0, total: 0 }
      }
      
      if (transaction.tipo === 'receita') {
        acc[categoryName].receitas += valor
      } else {
        acc[categoryName].despesas += valor
      }
      
      acc[categoryName].total = acc[categoryName].receitas - acc[categoryName].despesas
      
      return acc
    }, {} as Record<string, { receitas: number; despesas: number; total: number }>)

    // Group by type for chart data
    const chartData = [
      { name: 'Receitas', value: receitas, color: '#22c55e' },
      { name: 'Despesas', value: despesas, color: '#ef4444' }
    ]

    return {
      receitas,
      despesas,
      saldo,
      byCategory,
      chartData,
      totalTransactions: transactions.length
    }
  }
}
