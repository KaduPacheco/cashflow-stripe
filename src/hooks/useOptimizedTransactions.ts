
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { validateAuthentication } from '@/lib/security'
import { handleError, NetworkError } from '@/utils/errorHandler'
import { useTransactionFilters } from '@/hooks/useTransactionFilters'
import { useTransactionCrud } from '@/hooks/useTransactionCrud'
import { useTransactionStats } from '@/hooks/useTransactionStats'

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

export function useOptimizedTransactions() {
  const { user, session } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Use the specialized hooks
  const {
    filters,
    setFilters,
    debouncedSearch,
    filteredTransactions
  } = useTransactionFilters(transactions)

  const {
    createTransaction: createTransactionCrud,
    updateTransaction: updateTransactionCrud,
    deleteTransaction: deleteTransactionCrud,
    error: crudError,
    setError: setCrudError
  } = useTransactionCrud()

  const stats = useTransactionStats(filteredTransactions)

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

  // Wrap CRUD operations to update local state
  const createTransaction = useCallback(async (data: Omit<Transaction, 'id' | 'userId' | 'created_at' | 'updated_at'>) => {
    const result = await createTransactionCrud(data)
    if (result.success && result.data) {
      setTransactions(prev => [result.data, ...prev])
    }
    return result
  }, [createTransactionCrud])

  const updateTransaction = useCallback(async (id: number, data: Partial<Omit<Transaction, 'id' | 'userId' | 'created_at' | 'updated_at'>>) => {
    const result = await updateTransactionCrud(id, data, transactions)
    if (result.success && result.data) {
      setTransactions(prev => prev.map(t => t.id === id ? result.data : t))
    }
    return result
  }, [updateTransactionCrud, transactions])

  const deleteTransaction = useCallback(async (id: number) => {
    const result = await deleteTransactionCrud(id, transactions)
    if (result.success) {
      setTransactions(prev => prev.filter(t => t.id !== id))
    }
    return result
  }, [deleteTransactionCrud, transactions])

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchTransactions()
    }
  }, [fetchTransactions, user])

  // Sync CRUD errors with main error state
  useEffect(() => {
    if (crudError) {
      setError(crudError)
      setCrudError(null)
    }
  }, [crudError, setCrudError])

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
    totalReceita: stats.totalReceita,
    totalDespesa: stats.totalDespesa,
    transactionCount: stats.transactionCount
  }
}
