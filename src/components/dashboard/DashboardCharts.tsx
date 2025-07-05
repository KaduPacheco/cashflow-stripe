
import React from 'react'
import { ExpensesByCategoryChart } from './ExpensesByCategoryChart'
import { LembretesDoDiaCard } from './LembretesDoDiaCard'
import { DashboardTipCard } from './DashboardTipCard'
import { RevenueVsExpensesChart } from './RevenueVsExpensesChart'
import { DashboardStats } from './DashboardStats'

interface Transacao {
  id: number
  created_at: string
  quando: string | null
  estabelecimento: string | null
  valor: number | null
  detalhes: string | null
  tipo: string | null
  category_id: string
  userId: string | null
  categorias?: {
    id: string
    nome: string
  }
}

interface DashboardStats {
  totalReceitas: number
  totalDespesas: number
  saldo: number
  transacoesCount: number
  lembretesCount: number
}

interface DashboardChartsProps {
  transacoes: Transacao[]
  stats: DashboardStats
  isSubscribed: boolean
  dicaDoDia: string
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  transacoes,
  stats,
  isSubscribed,
  dicaDoDia
}) => {
  return (
    <>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <ExpensesByCategoryChart 
          transacoes={transacoes}
          isSubscribed={isSubscribed}
        />

        <div className="space-y-6">
          <LembretesDoDiaCard />
          <DashboardTipCard tip={dicaDoDia} />
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <RevenueVsExpensesChart 
          transacoes={transacoes}
          totalReceitas={stats.totalReceitas}
        />

        <DashboardStats
          receitas={stats.totalReceitas}
          despesas={stats.totalDespesas}
          saldo={stats.saldo}
          transacoesCount={stats.transacoesCount}
          lembretesCount={stats.lembretesCount}
        />
      </div>
    </>
  )
}
