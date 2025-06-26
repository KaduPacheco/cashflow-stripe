
import { useState, useMemo } from 'react'
import { useOptimizedDebounce } from '@/hooks/useOptimizedDebounce'

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

export function useTransactionFilters(transactions: Transaction[]) {
  const [filters, setFilters] = useState<TransactionFilters>({
    tipo: 'all'
  })

  // Debounced search to avoid excessive filtering
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

  return {
    filters,
    setFilters,
    debouncedSearch,
    filteredTransactions
  }
}
