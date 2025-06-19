
import { useState, useEffect } from 'react'
import { useCategories } from '@/hooks/useCategories'
import { useClientesFornecedores } from '@/hooks/useClientesFornecedores'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Search, X } from 'lucide-react'
import type { ContasFilters as IContasFilters } from '@/types/contas'

interface ContasFiltersProps {
  filters: IContasFilters
  onFiltersChange: (filters: IContasFilters) => void
  tipo: 'pagar' | 'receber'
}

export function ContasFilters({ filters, onFiltersChange, tipo }: ContasFiltersProps) {
  const { categories } = useCategories()
  const { clientesFornecedores } = useClientesFornecedores()
  const [localFilters, setLocalFilters] = useState<IContasFilters>(filters)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleFilterChange = (key: keyof IContasFilters, value: string) => {
    const newFilters = { ...localFilters, [key]: value || undefined }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = { tipo }
    setLocalFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const statusOptions = [
    { value: 'pendente', label: 'Pendente' },
    { value: 'pago', label: 'Pago' },
    { value: 'parcialmente_pago', label: 'Parcialmente Pago' },
    { value: 'vencido', label: 'Vencido' },
    { value: 'cancelado', label: 'Cancelado' },
  ]

  const tipoContato = tipo === 'pagar' ? 'fornecedor' : 'cliente'
  const clientesFornecedoresFiltrados = clientesFornecedores.filter(cf => 
    cf.tipo === tipoContato || cf.tipo === 'ambos'
  )

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <Label htmlFor="busca">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="busca"
                placeholder="Descrição..."
                value={localFilters.busca || ''}
                onChange={(e) => handleFilterChange('busca', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={localFilters.status || 'all'} onValueChange={(value) => handleFilterChange('status', value === 'all' ? '' : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="categoria">Categoria</Label>
            <Select value={localFilters.categoria || 'all'} onValueChange={(value) => handleFilterChange('categoria', value === 'all' ? '' : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="cliente_fornecedor">{tipo === 'pagar' ? 'Fornecedor' : 'Cliente'}</Label>
            <Select value={localFilters.cliente_fornecedor || 'all'} onValueChange={(value) => handleFilterChange('cliente_fornecedor', value === 'all' ? '' : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {clientesFornecedoresFiltrados.map((cf) => (
                  <SelectItem key={cf.id} value={cf.id}>
                    {cf.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="data_inicio">Data Início</Label>
            <Input
              id="data_inicio"
              type="date"
              value={localFilters.data_inicio || ''}
              onChange={(e) => handleFilterChange('data_inicio', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="data_fim">Data Fim</Label>
            <Input
              id="data_fim"
              type="date"
              value={localFilters.data_fim || ''}
              onChange={(e) => handleFilterChange('data_fim', e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={clearFilters} size="sm">
            <X className="h-4 w-4 mr-2" />
            Limpar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
