
import React, { memo, useCallback, useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'
import { useCategories } from '@/hooks/useCategories'
import { useOptimizedDebounce } from '@/hooks/useOptimizedDebounce'
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor'

interface OptimizedTransactionFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  typeFilter: string
  onTypeFilterChange: (value: string) => void
  categoryFilter: string
  onCategoryFilterChange: (value: string) => void
  onClearFilters: () => void
}

export const OptimizedTransactionFilters = memo(({
  searchTerm,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  onClearFilters
}: OptimizedTransactionFiltersProps) => {
  usePerformanceMonitor('OptimizedTransactionFilters');
  
  const { categories } = useCategories()
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm)
  
  // Debounce search with optimized performance settings
  const debouncedSearch = useOptimizedDebounce(
    onSearchChange, 
    300, 
    { trailing: true, maxWait: 1000 }
  )
  
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalSearchTerm(value)
    debouncedSearch(value)
  }, [debouncedSearch])

  // Sync local search term with external changes
  useEffect(() => {
    setLocalSearchTerm(searchTerm)
  }, [searchTerm])

  const hasActiveFilters = searchTerm || typeFilter !== 'todos' || categoryFilter !== 'todas'

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
      <div className="flex-1 space-y-2">
        <label className="text-sm font-medium">Buscar</label>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por estabelecimento ou detalhes..."
            value={localSearchTerm}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>
      </div>

      <div className="w-full sm:w-48 space-y-2">
        <label className="text-sm font-medium">Tipo</label>
        <Select value={typeFilter} onValueChange={onTypeFilterChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            <SelectItem value="receita">Receitas</SelectItem>
            <SelectItem value="despesa">Despesas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-full sm:w-48 space-y-2">
        <label className="text-sm font-medium">Categoria</label>
        <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as categorias</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={onClearFilters}
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          Limpar
        </Button>
      )}
    </div>
  )
})

OptimizedTransactionFilters.displayName = "OptimizedTransactionFilters"
