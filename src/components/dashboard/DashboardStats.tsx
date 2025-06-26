
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react'
import { formatCurrency } from '@/utils/currency'

interface DashboardStatsProps {
  stats: {
    totalReceitas: number
    totalDespesas: number
    saldo: number
    transacoesCount: number
    lembretesCount: number
  }
  subscribed: boolean
}

export function DashboardStats({ stats, subscribed }: DashboardStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total de Receitas
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${stats.totalReceitas > 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
            {formatCurrency(stats.totalReceitas)}
          </div>
          <p className="text-xs text-muted-foreground">
            {subscribed ? "Mês atual" : "Últimos registros"}
          </p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-red-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total de Despesas
          </CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(stats.totalDespesas)}
          </div>
          <p className="text-xs text-muted-foreground">
            {subscribed ? "Mês atual" : "Últimos registros"}
          </p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-primary">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Saldo Atual
          </CardTitle>
          <DollarSign className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${stats.saldo >= 0 ? 'text-primary' : 'text-red-600'}`}>
            {formatCurrency(stats.saldo)}
          </div>
          <p className="text-xs text-muted-foreground">
            Receitas - Despesas
          </p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-purple-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Lembretes Ativos
          </CardTitle>
          <Calendar className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {stats.lembretesCount}
          </div>
          <p className="text-xs text-muted-foreground">
            {subscribed ? "Este mês" : "Próximos"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
