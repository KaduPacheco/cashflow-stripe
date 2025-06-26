
import { useState, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { validateTransaction, validateTransactionUpdate } from '@/lib/validations'
import { validateAuthentication, validateResourceOwnership, validateRateLimit } from '@/lib/security'
import { handleError, ValidationError, NetworkError } from '@/utils/errorHandler'
import { toast } from 'sonner'

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

export function useTransactionCrud() {
  const { user, session } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createTransaction = useCallback(async (data: Omit<Transaction, 'id' | 'userId' | 'created_at' | 'updated_at'>) => {
    try {
      validateAuthentication(user, session)
      validateRateLimit(`create_transaction_${user?.id}`)

      // Validate input data
      const validation = validateTransaction(data)
      if (!validation.success) {
        throw new ValidationError(
          validation.error.errors[0].message,
          validation.error.errors[0].path[0] as string
        )
      }

      const transactionData = {
        ...validation.data,
        userId: user!.id
      }

      const { data: newTransaction, error: createError } = await supabase
        .from('transacoes')
        .insert([transactionData])
        .select()
        .single()

      if (createError) {
        throw new NetworkError(createError.message, 500, 'CREATE_ERROR')
      }

      toast.success('Transação criada com sucesso!')
      return { success: true, data: newTransaction }
    } catch (err) {
      const appError = handleError(err, true)
      return { success: false, error: appError.message }
    }
  }, [user, session])

  const updateTransaction = useCallback(async (id: number, data: Partial<Omit<Transaction, 'id' | 'userId' | 'created_at' | 'updated_at'>>, transactions: Transaction[]) => {
    try {
      validateAuthentication(user, session)
      validateRateLimit(`update_transaction_${user?.id}`)

      // Validate input data
      const validation = validateTransactionUpdate(data)
      if (!validation.success) {
        throw new ValidationError(
          validation.error.errors[0].message,
          validation.error.errors[0].path[0] as string
        )
      }

      // Check ownership
      const existingTransaction = transactions.find(t => t.id === id)
      if (existingTransaction) {
        validateResourceOwnership(existingTransaction.userId, user!.id)
      }

      const { data: updatedTransaction, error: updateError } = await supabase
        .from('transacoes')
        .update(validation.data)
        .eq('id', id)
        .eq('userId', user!.id)
        .select()
        .single()

      if (updateError) {
        throw new NetworkError(updateError.message, 500, 'UPDATE_ERROR')
      }

      toast.success('Transação atualizada com sucesso!')
      return { success: true, data: updatedTransaction }
    } catch (err) {
      const appError = handleError(err, true)
      return { success: false, error: appError.message }
    }
  }, [user, session])

  const deleteTransaction = useCallback(async (id: number, transactions: Transaction[]) => {
    try {
      validateAuthentication(user, session)
      validateRateLimit(`delete_transaction_${user?.id}`)

      // Check ownership
      const existingTransaction = transactions.find(t => t.id === id)
      if (existingTransaction) {
        validateResourceOwnership(existingTransaction.userId, user!.id)
      }

      const { error: deleteError } = await supabase
        .from('transacoes')
        .delete()
        .eq('id', id)
        .eq('userId', user!.id)

      if (deleteError) {
        throw new NetworkError(deleteError.message, 500, 'DELETE_ERROR')
      }

      toast.success('Transação excluída com sucesso!')
      return { success: true }
    } catch (err) {
      const appError = handleError(err, true)
      return { success: false, error: appError.message }
    }
  }, [user, session])

  return {
    loading,
    error,
    setError,
    createTransaction,
    updateTransaction,
    deleteTransaction
  }
}
