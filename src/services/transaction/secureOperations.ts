import { supabase } from '@/integrations/supabase/client'
import { validateTransaction, validateTransactionUpdate } from '@/lib/validations'
import { ValidationError, NetworkError } from '@/utils/errorHandler'
import { XSSProtectionService } from '@/services/xssProtectionService'
import type { CreateTransactionData, UpdateTransactionData, TransactionFilters } from './types'

export class SecureTransactionOperations {
  static async create(userId: string, data: CreateTransactionData) {
    try {
      // Validação local primeiro
      const validation = validateTransaction(data)
      if (!validation.success) {
        throw new ValidationError(
          validation.error.errors[0].message,
          validation.error.errors[0].path[0] as string
        )
      }

      // Sanitização no servidor
      const sanitizedData = await XSSProtectionService.sanitizeData(
        'create',
        validation.data,
        'transaction'
      )

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

  static async update(id: number, userId: string, data: UpdateTransactionData) {
    try {
      // Validação local
      const validation = validateTransactionUpdate(data)
      if (!validation.success) {
        throw new ValidationError(
          validation.error.errors[0].message,
          validation.error.errors[0].path[0] as string
        )
      }

      // Sanitização no servidor
      const sanitizedData = await XSSProtectionService.sanitizeData(
        'update',
        validation.data,
        'transaction'
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
      const baseQuery = supabase
        .from('transacoes')
        .select('*')
        .eq('userId', userId)

      let query = baseQuery

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
