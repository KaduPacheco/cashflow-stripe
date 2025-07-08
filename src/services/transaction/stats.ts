
import { supabase } from '@/lib/supabase'
import { NetworkError } from '@/utils/errorHandler'
import type { TransactionStats } from './types'

export class TransactionStats {
  static async calculate(
    userId: string, 
    dateFrom?: string, 
    dateTo?: string, 
    includeArchived?: boolean
  ): Promise<{ success: true; data: TransactionStats }> {
    try {
      let query = supabase
        .from('transacoes')
        .select('tipo, valor')
        .eq('userId', userId)

      // Filtrar dados arquivados por padrão
      if (!includeArchived) {
        query = query.eq('archived', false)
      }

      if (dateFrom) {
        query = query.gte('quando', dateFrom)
      }
      if (dateTo) {
        query = query.lte('quando', dateTo)
      }

      const { data, error } = await query

      if (error) {
        throw new NetworkError(error.message, 500, 'DATABASE_ERROR')
      }

      const stats = (data || []).reduce(
        (acc, transaction) => {
          if (transaction.tipo === 'receita') {
            acc.totalReceitas += transaction.valor
            acc.countReceita += 1
          } else {
            acc.totalDespesas += transaction.valor
            acc.countDespesa += 1
          }
          return acc
        },
        { totalReceitas: 0, totalDespesas: 0, countReceita: 0, countDespesa: 0 }
      )

      return {
        success: true,
        data: {
          totalReceitas: stats.totalReceitas,
          totalDespesas: stats.totalDespesas,
          saldo: stats.totalReceitas - stats.totalDespesas,
          totalTransactions: stats.countReceita + stats.countDespesa
        }
      }
    } catch (error) {
      if (error instanceof NetworkError) {
        throw error
      }
      throw new NetworkError('Erro ao calcular estatísticas', 500, 'UNKNOWN_ERROR')
    }
  }
}
