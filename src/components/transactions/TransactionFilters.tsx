
import React from 'react'
import { OptimizedTransactionFilters } from './OptimizedTransactionFilters'

interface TransactionFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  typeFilter: string
  onTypeFilterChange: (value: string) => void
  categoryFilter: string
  onCategoryFilterChange: (value: string) => void
  onClearFilters: () => void
}

export function TransactionFilters(props: TransactionFiltersProps) {
  return <OptimizedTransactionFilters {...props} />
}
