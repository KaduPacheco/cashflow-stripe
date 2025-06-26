
import { supabase } from '@/lib/supabase'
import { validateTransaction, validateTransactionUpdate } from '@/lib/validations'
import { validateAuthentication, validateResourceOwnership, sanitizeInput } from '@/lib/security'
import { ValidationError, NetworkError } from '@/utils/errorHandler'

export interface Transaction {
  id?: number
  estabelecimento: string
  valor: number
  tipo: 'receita' | 'despesa'
  category_id: string
  detalhes?: string
  quando: string
  userId?: string
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

export class TransactionService {
  static async createTransaction(
    userId: string, 
    data: CreateTransactionData
  ) {
    try {
      // Validate and sanitize input
      const validation = validateTransaction(data)
      if (!validation.success) {
        throw new ValidationError(
          validation.error.errors[0].message,
          validation.error.errors[0].path[0] as string
        )
      }

      // Sanitize string inputs
      const sanitizedData = {
        ...validation.data,
        estabelecimento: sanitizeInput(validation.data.estabelecimento),
        detalhes: validation.data.detalhes ? sanitizeInput(validation.data.detalhes) : undefined,
        userId
      }

      const { data: transaction, error } = await supabase
        .from('transacoes')
        .insert([sanitizedData])
        .select()
        .single()

      if (error) {
        throw new NetworkError(error.message, 500, 'DATABASE_ERROR')
      }

      return { success: true, data: transaction }
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NetworkError) {
        throw error
      }
      throw new NetworkError('Erro ao criar transação', 500, 'UNKNOWN_ERROR')
    }
  }

  static async updateTransaction(
    id: number,
    userId: string,
    data: UpdateTransactionData
  ) {
    try {
      // Validate input
      const validation = validateTransactionUpdate(data)
      if (!validation.success) {
        throw new ValidationError(
          validation.error.errors[0].message,
          validation.error.errors[0].path[0] as string
        )
      }

      // Sanitize string inputs
      const sanitizedData = Object.fromEntries(
        Object.entries(validation.data).map(([key, value]) => [
          key,
          typeof value === 'string' ? sanitizeInput(value) : value
        ])
      )

      const { data: transaction, error } = await supabase
        .from('transacoes')
        .update(sanitizedData)
        .eq('id', id)
        .eq('userId', userId)
        .select()
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new ValidationError('Transação não encontrada ou sem permissão', 'id')
        }
        throw new NetworkError(error.message, 500, 'DATABASE_ERROR')
      }

      return { success: true, data: transaction }
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NetworkError) {
        throw error
      }
      throw new NetworkError('Erro ao atualizar transação', 500, 'UNKNOWN_ERROR')
    }
  }

  static async deleteTransaction(id: number, userId?: string) {
    try {
      let query = supabase.from('transacoes').delete().eq('id', id)
      
      // Add user filter if provided for extra security
      if (userId) {
        query = query.eq('userId', userId)
      }

      const { error } = await query

      if (error) {
        if (error.code === 'PGRST116') {
          throw new ValidationError('Transação não encontrada ou sem permissão', 'id')
        }
        throw new NetworkError(error.message, 500, 'DATABASE_ERROR')
      }

      return { success: true }
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NetworkError) {
        throw error
      }
      throw new NetworkError('Erro ao excluir transação', 500, 'UNKNOWN_ERROR')
    }
  }

  static async getTransactions(userId: string, filters?: {
    tipo?: 'receita' | 'despesa'
    category_id?: string
    dateFrom?: string
    dateTo?: string
    limit?: number
    offset?: number
  }) {
    try {
      let query = supabase
        .from('transacoes')
        .select('*')
        .eq('userId', userId)

      // Apply filters
      if (filters?.tipo) {
        query = query.eq('tipo', filters.tipo)
      }
      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id)
      }
      if (filters?.dateFrom) {
        query = query.gte('quando', filters.dateFrom)
      }
      if (filters?.dateTo) {
        query = query.lte('quando', filters.dateTo)
      }

      // Add pagination
      if (filters?.limit) {
        query = query.limit(filters.limit)
      }
      if (filters?.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 50)) - 1)
      }

      // Order by date
      query = query.order('quando', { ascending: false })
      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) {
        throw new NetworkError(error.message, 500, 'DATABASE_ERROR')
      }

      return { success: true, data: data || [] }
    } catch (error) {
      if (error instanceof NetworkError) {
        throw error
      }
      throw new NetworkError('Erro ao buscar transações', 500, 'UNKNOWN_ERROR')
    }
  }

  static async getTransactionStats(userId: string, dateFrom?: string, dateTo?: string) {
    try {
      let query = supabase
        .from('transacoes')
        .select('tipo, valor')
        .eq('userId', userId)

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
            acc.totalReceita += transaction.valor
            acc.countReceita += 1
          } else {
            acc.totalDespesa += transaction.valor
            acc.countDespesa += 1
          }
          return acc
        },
        { totalReceita: 0, totalDespesa: 0, countReceita: 0, countDespesa: 0 }
      )

      return {
        success: true,
        data: {
          ...stats,
          saldo: stats.totalReceita - stats.totalDespesa,
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
