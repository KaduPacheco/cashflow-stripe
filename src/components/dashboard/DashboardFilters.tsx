
import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Filter, Lock } from 'lucide-react'

interface DashboardFiltersProps {
  subscribed: boolean
  filterMonth: string
  setFilterMonth: (month: string) => void
  filterYear: string
  setFilterYear: (year: string) => void
}

export function DashboardFilters({ 
  subscribed, 
  filterMonth, 
  setFilterMonth, 
  filterYear, 
  setFilterYear 
}: DashboardFiltersProps) {
  if (subscribed) {
    return (
      <div className="flex gap-2 items-center">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={filterMonth} onValueChange={setFilterMonth}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }, (_, i) => (
              <SelectItem key={i} value={i.toString()}>
                {new Date(0, i).toLocaleDateString('pt-BR', { month: 'long' })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterYear} onValueChange={setFilterYear}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 5 }, (_, i) => {
              const year = new Date().getFullYear() - 2 + i
              return (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Lock className="h-4 w-4" />
      <span className="text-sm">Filtros disponíveis com assinatura</span>
    </div>
  )
}
