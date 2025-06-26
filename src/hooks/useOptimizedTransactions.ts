import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { validateTransaction, validateTransactionUpdate } from '@/lib/validations'
import { validateAuthentication, validateResourceOwnership, validateRateLimit } from '@/lib/security'
import { handleError, ValidationError, NetworkError } from '@/utils/errorHandler'
import { useOptimizedDebounce } from '@/hooks/useOptimizedDebounce'
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

interface TransactionFilters {
  search?: string
  tipo?: 'receita' | 'despesa' | 'all'
  category_id?: string
  dateFrom?: string
  dateTo?: string
}

export function useOptimizedTransactions() {
  const { user, session } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<TransactionFilters>({
    tipo: 'all'
  })

  // Debounced search to avoid excessive API calls
  const debouncedSearch = useOptimizedDebounce(
    (searchTerm: string) => {
      setFilters(prev => ({ ...prev, search: searchTerm }))
    },
    300,
    { leading: false, trailing: true }
  )

  // Memoized filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        if (!transaction.estabelecimento.toLowerCase().includes(searchLower) &&
            !transaction.detalhes?.toLowerCase().includes(searchLower)) {
          return false
        }
      }

      // Type filter - corrigido para case-insensitive
      if (filters.tipo && filters.tipo !== 'all' && transaction.tipo?.toLowerCase() !== filters.tipo.toLowerCase()) {
        return false
      }

      // Category filter
      if (filters.category_id && transaction.category_id !== filters.category_id) {
        return false
      }

      // Date filters
      if (filters.dateFrom && transaction.quando < filters.dateFrom) {
        return false
      }
      if (filters.dateTo && transaction.quando > filters.dateTo) {
        return false
      }

      return true
    })
  }, [transactions, filters])

  const fetchTransactions = useCallback(async () => {
    try {
      validateAuthentication(user, session)
      
      if (!user) return

      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('transacoes')
        .select('*')
        .eq('userId', user.id)
        .order('quando', { ascending: false })
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw new NetworkError(fetchError.message, 500, 'FETCH_ERROR')
      }

      console.log('useOptimizedTransactions: Transactions fetched:', data?.length || 0)
      
      // Log tipos encontrados para auditoria
      const tiposEncontrados = data?.map(t => t.tipo).filter(Boolean)
      console.log('useOptimizedTransactions: Tipos encontrados:', [...new Set(tiposEncontrados)])

      setTransactions(data || [])
    } catch (err) {
      const appError = handleError(err, true)
      setError(appError.message)
    } finally {
      setLoading(false)
    }
  }, [user, session])

  const createTransaction = useCallback(async (data: Omit<Transaction, 'id' | 'userId' | 'created_at' | 'updated_at'>) => {
    try {
      validateAuthentication(user, session)
      validateRateLimit(`create_transaction_${user?.id}`) // Remove the 30 parameter to use default

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

      // Optimistically update local state
      setTransactions(prev => [newTransaction, ...prev])

      toast.success('Transação criada com sucesso!')
      return { success: true, data: newTransaction }
    } catch (err) {
      const appError = handleError(err, true)
      return { success: false, error: appError.message }
    }
  }, [user, session])

  const updateTransaction = useCallback(async (id: number, data: Partial<Omit<Transaction, 'id' | 'userId' | 'created_at' | 'updated_at'>>) => {
    try {
      validateAuthentication(user, session)
      validateRateLimit(`update_transaction_${user?.id}`) // Remove the 60 parameter to use default

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

      // Optimistically update local state
      setTransactions(prev => prev.map(t => t.id === id ? updatedTransaction : t))

      toast.success('Transação atualizada com sucesso!')
      return { success: true, data: updatedTransaction }
    } catch (err) {
      const appError = handleError(err, true)
      return { success: false, error: appError.message }
    }
  }, [user, session, transactions])

  const deleteTransaction = useCallback(async (id: number) => {
    try {
      validateAuthentication(user, session)
      validateRateLimit(`delete_transaction_${user?.id}`) // Remove the 30 parameter to use default

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

      // Optimistically update local state
      setTransactions(prev => prev.filter(t => t.id !== id))

      toast.success('Transação excluída com sucesso!')
      return { success: true }
    } catch (err) {
      const appError = handleError(err, true)
      return { success: false, error: appError.message }
    }
  }, [user, session, transactions])

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchTransactions()
    }
  }, [fetchTransactions, user])

  return {
    transactions: filteredTransactions,
    loading,
    error,
    filters,
    setFilters,
    debouncedSearch,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    // Statistics - corrigido para case-insensitive
    totalReceita: filteredTransactions
      .filter(t => t.tipo?.toLowerCase() === 'receita')
      .reduce((sum, t) => sum + (Number(t.valor) || 0), 0),
    totalDespesa: filteredTransactions
      .filter(t => t.tipo?.toLowerCase() === 'despesa')
      .reduce((sum, t) => sum + Math.abs(Number(t.valor) || 0), 0),
    transactionCount: filteredTransactions.length
  }
}
