
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/utils/currency'

interface DashboardSummaryProps {
  stats: {
    totalReceitas: number
    totalDespesas: number
    saldo: number
    transacoesCount: number
    lembretesCount: number
  }
}

export function DashboardSummary({ stats }: DashboardSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo do Período</CardTitle>
        <CardDescription>
          Estatísticas detalhadas do período selecionado
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Receitas</span>
            <span className="text-green-600 font-semibold">
              {formatCurrency(stats.totalReceitas)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Despesas</span>
            <span className="text-red-600 font-semibold">
              {formatCurrency(stats.totalDespesas)}
            </span>
          </div>
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Saldo</span>
              <span className={`font-bold ${stats.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(stats.saldo)}
              </span>
            </div>
          </div>
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-sm">
              <span>Total de Transações</span>
              <span className="font-semibold">{stats.transacoesCount}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span>Lembretes Ativos</span>
              <span className="font-semibold">{stats.lembretesCount}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
