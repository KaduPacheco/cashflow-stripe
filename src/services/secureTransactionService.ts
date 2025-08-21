
import { supabase } from '@/lib/supabase'
import { SecurityAuditService } from './securityAuditService'
import { XSSProtectionService } from './xssProtectionService'
import { AuthorizationService } from './authorizationService'
import { ValidationError, NetworkError } from '@/utils/errorHandler'
import type { Transacao } from '@/types/transaction'

export class SecureTransactionService {
  /**
   * Create transaction with full security validation
   */
  static async createTransaction(transactionData: Partial<Transacao>): Promise<Transacao> {
    try {
      // 1. Validate user authentication and session
      const { user } = await SecurityAuditService.validateUserAccess()

      // 2. Sanitize inputs using server-side XSS protection
      const sanitizedData = await XSSProtectionService.sanitizeData('create', transactionData, 'transaction')

      // 3. Additional client-side sanitization
      const doubleSanitized = SecurityAuditService.sanitizeUserInputs(sanitizedData)

      // 4. Ensure user ownership
      doubleSanitized.userId = user.id

      // 5. Create transaction
      const { data, error } = await supabase
        .from('transacoes')
        .insert(doubleSanitized)
        .select()
        .single()

      if (error) {
        await SecurityAuditService.logSecurityOperation(
          'transaction_create_failed',
          user.id,
          'transacoes',
          undefined,
          false,
          { error: error.message }
        )
        throw new ValidationError('Falha ao criar transação', 'create_failed')
      }

      // 6. Log successful operation
      await SecurityAuditService.logSecurityOperation(
        'transaction_created',
        user.id,
        'transacoes',
        data.id.toString(),
        true
      )

      return data
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error
      }
      throw new NetworkError('Erro interno ao criar transação', 500, 'CREATE_ERROR')
    }
  }

  /**
   * Update transaction with authorization checks
   */
  static async updateTransaction(id: number, updateData: Partial<Transacao>): Promise<Transacao> {
    try {
      // 1. Validate authentication
      const { user } = await SecurityAuditService.validateUserAccess()

      // 2. Use authorization service for secure update
      const result = await AuthorizationService.secureUpdate(
        'transacoes',
        id.toString(),
        updateData,
        async () => {
          // 3. Sanitize data
          const sanitizedData = await XSSProtectionService.sanitizeData('update', updateData, 'transaction')
          const doubleSanitized = SecurityAuditService.sanitizeUserInputs(sanitizedData)

          // 4. Perform update
          const { data, error } = await supabase
            .from('transacoes')
            .update(doubleSanitized)
            .eq('id', id)
            .eq('userId', user.id)
            .select()
            .single()

          if (error) {
            throw new ValidationError('Falha ao atualizar transação', 'update_failed')
          }

          return data
        }
      )

      // 5. Log successful operation
      await SecurityAuditService.logSecurityOperation(
        'transaction_updated',
        user.id,
        'transacoes',
        id.toString(),
        true
      )

      return result
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error
      }
      throw new NetworkError('Erro interno ao atualizar transação', 500, 'UPDATE_ERROR')
    }
  }

  /**
   * Delete transaction with authorization checks
   */
  static async deleteTransaction(id: number): Promise<void> {
    try {
      // 1. Validate authentication
      const { user } = await SecurityAuditService.validateUserAccess()

      // 2. Use authorization service for secure delete
      await AuthorizationService.secureDelete(
        'transacoes',
        id.toString(),
        async () => {
          const { error } = await supabase
            .from('transacoes')
            .delete()
            .eq('id', id)
            .eq('userId', user.id)

          if (error) {
            throw new ValidationError('Falha ao excluir transação', 'delete_failed')
          }
        }
      )

      // 3. Log successful operation
      await SecurityAuditService.logSecurityOperation(
        'transaction_deleted',
        user.id,
        'transacoes',
        id.toString(),
        true
      )
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error
      }
      throw new NetworkError('Erro interno ao excluir transação', 500, 'DELETE_ERROR')
    }
  }

  /**
   * Get transactions with user validation
   */
  static async getTransactions(filters?: any): Promise<Transacao[]> {
    try {
      // 1. Validate authentication
      const { user } = await SecurityAuditService.validateUserAccess()

      // 2. Build query with user filter
      let query = supabase
        .from('transacoes')
        .select(`
          *,
          categorias (
            id,
            nome,
            icone,
            cor
          )
        `)
        .eq('userId', user.id)
        .order('quando', { ascending: false })

      // 3. Apply additional filters if provided
      if (filters?.categoria_id) {
        query = query.eq('category_id', filters.categoria_id)
      }
      if (filters?.tipo) {
        query = query.eq('tipo', filters.tipo)
      }
      if (filters?.dataInicio) {
        query = query.gte('quando', filters.dataInicio)
      }
      if (filters?.dataFim) {
        query = query.lte('quando', filters.dataFim)
      }

      const { data, error } = await query

      if (error) {
        await SecurityAuditService.logSecurityOperation(
          'transaction_fetch_failed',
          user.id,
          'transacoes',
          undefined,
          false,
          { error: error.message }
        )
        throw new ValidationError('Falha ao buscar transações', 'fetch_failed')
      }

      return data || []
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error
      }
      throw new NetworkError('Erro interno ao buscar transações', 500, 'FETCH_ERROR')
    }
  }
}
