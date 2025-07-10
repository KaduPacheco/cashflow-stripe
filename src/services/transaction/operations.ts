
import { supabase } from '@/lib/supabase'
import { validateTransactionUpdate } from '@/lib/validations'
import { sanitizeInput } from '@/lib/security'
import { ValidationError, NetworkError } from '@/utils/errorHandler'
import { TransactionValidation } from './validation'
import type { CreateTransactionData, UpdateTransactionData, TransactionFilters } from './types'

export class TransactionOperations {
  static async create(userId: string, data: CreateTransactionData) {
    try {
      // Obter token de sessão para validação server-side
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new ValidationError('Sessão inválida', 'auth')
      }

      // Validação server-side with rate limiting
      const validatedData = await TransactionValidation.validateTransactionServerSide(
        'transaction_create',
        data,
        session.access_token
      )

      const { data: transaction, error } = await supabase
        .from('transacoes')
        .insert([validatedData])
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

  static async update(id: number, userId: string, data: UpdateTransactionData) {
    try {
      // Validação local para updates (menos crítico que creates)
      const validation = validateTransactionUpdate(data)
      if (!validation.success) {
        throw new ValidationError(
          validation.error.errors[0].message,
          validation.error.errors[0].path[0] as string
        )
      }

      // Sanitizar dados
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

  static async delete(id: number, userId?: string) {
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

  static async getAll(userId: string, filters?: TransactionFilters) {
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
}
