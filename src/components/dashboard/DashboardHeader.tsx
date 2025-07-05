
import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Filter, Lock } from 'lucide-react'

interface DashboardHeaderProps {
  transacaoCount: number
  isSubscribed: boolean
  filterMonth: string
  filterYear: string
  onFilterMonthChange: (value: string) => void
  onFilterYearChange: (value: string) => void
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  transacaoCount,
  isSubscribed,
  filterMonth,
  filterYear,
  onFilterMonthChange,
  onFilterYearChange
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          Dashboard
        </h2>
        <p className="text-muted-foreground text-lg">
          Visão geral das suas finanças pessoais
          {transacaoCount > 0 && ` • ${transacaoCount} transações encontradas`}
          {!isSubscribed && " • Versão gratuita (últimos 5 registros)"}
        </p>
      </div>
      
      {isSubscribed ? (
        <div className="flex gap-3 items-center bg-card/50 backdrop-blur-sm rounded-2xl p-3 border border-border/50">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterMonth} onValueChange={onFilterMonthChange}>
            <SelectTrigger className="w-36 rounded-xl border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i} value={i.toString()} className="rounded-lg">
                  {new Date(0, i).toLocaleDateString('pt-BR', { month: 'long' })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterYear} onValueChange={onFilterYearChange}>
            <SelectTrigger className="w-28 rounded-xl border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - 2 + i
                return (
                  <SelectItem key={year} value={year.toString()} className="rounded-lg">
                    {year}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-muted-foreground bg-muted/50 px-4 py-2 rounded-2xl">
          <Lock className="h-4 w-4" />
          <span className="text-sm">Filtros disponíveis com assinatura</span>
        </div>
      )}
    </div>
  )
}
