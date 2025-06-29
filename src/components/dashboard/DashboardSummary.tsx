
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign } from 'lucide-react'
import { formatCurrency } from '@/utils/currency'

interface DashboardStats {
  totalReceitas: number
  totalDespesas: number
  saldo: number
  transacoesCount: number
  lembretesCount: number
}

interface DashboardSummaryProps {
  stats: DashboardStats
  receitas: number
}

export function DashboardSummary({ stats, receitas }: DashboardSummaryProps) {
  return (
    <Card className="modern-card animate-scale-in" style={{animationDelay: '0.1s'}}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          Resumo do Período
        </CardTitle>
        <CardDescription>
          Estatísticas detalhadas do período selecionado
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-200 dark:border-emerald-800/30">
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Receitas</span>
            <span className="text-emerald-600 font-bold text-lg">
              {formatCurrency(receitas)}
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800/30">
            <span className="text-sm font-medium text-red-700 dark:text-red-300">Despesas</span>
            <span className="text-red-600 font-bold text-lg">
              {formatCurrency(stats.totalDespesas)}
            </span>
          </div>
          <div className="border-t pt-6">
            <div className={`flex items-center justify-between p-4 rounded-xl border ${
              stats.saldo >= 0 
                ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/30' 
                : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30'
            }`}>
              <span className={`text-sm font-medium ${stats.saldo >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-red-700 dark:text-red-300'}`}>Saldo</span>
              <span className={`font-bold text-xl ${stats.saldo >= 0 ? 'text-primary' : 'text-red-600'}`}>
                {formatCurrency(stats.saldo)}
              </span>
            </div>
          </div>
          <div className="pt-4 border-t space-y-4">
            <div className="flex items-center justify-between text-sm bg-muted/30 p-3 rounded-lg">
              <span className="text-muted-foreground">Total de Transações</span>
              <span className="font-semibold text-card-foreground">{stats.transacoesCount}</span>
            </div>
            <div className="flex items-center justify-between text-sm bg-muted/30 p-3 rounded-lg">
              <span className="text-muted-foreground">Lembretes Ativos</span>
              <span className="font-semibold text-card-foreground">{stats.lembretesCount}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
