
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import { SubscriptionBanner } from '@/components/subscription/SubscriptionBanner'
import { DashboardMetricsCards } from '@/components/dashboard/DashboardMetricsCards'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { DashboardCharts } from '@/components/dashboard/DashboardCharts'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { DashboardSummary } from '@/components/dashboard/DashboardSummary'
import { useDashboardData } from '@/hooks/useDashboardData'

const dicas = [
  "💡 Sempre registre suas despesas no mesmo dia para não esquecer",
  "💡 Defina metas mensais de economia e acompanhe seu progresso",
  "💡 Categorize suas despesas para identificar onde gasta mais",
  "💡 Configure lembretes para não perder datas de pagamento",
  "💡 Revise seus gastos semanalmente para manter o controle",
  "💡 Separe uma quantia fixa para emergências todo mês"
]

export default function Dashboard() {
  const { user } = useAuth()
  const { subscriptionData } = useSubscription()
  
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth().toString())
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString())
  const [dicaDoDia] = useState(dicas[new Date().getDate() % dicas.length])

  const { transacoes, lembretes, loading, stats, receitas } = useDashboardData(filterMonth, filterYear)

  if (!user?.id) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-muted-foreground">Usuário não encontrado</h2>
            <p className="text-muted-foreground">Faça login para visualizar seu dashboard</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <SubscriptionBanner />
      
      <DashboardHeader
        transacoesCount={transacoes.length}
        isSubscribed={subscriptionData.subscribed}
        filterMonth={filterMonth}
        filterYear={filterYear}
        onFilterMonthChange={setFilterMonth}
        onFilterYearChange={setFilterYear}
      />

      <DashboardMetricsCards 
        filterMonth={filterMonth} 
        filterYear={filterYear} 
      />

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <DashboardCharts 
          transacoes={transacoes}
          isSubscribed={subscriptionData.subscribed}
        />

        <DashboardSidebar 
          lembretes={lembretes}
          dicaDoDia={dicaDoDia}
        />
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <DashboardCharts 
          transacoes={transacoes}
          isSubscribed={subscriptionData.subscribed}
        />

        <DashboardSummary 
          stats={stats}
          receitas={receitas}
        />
      </div>
    </div>
  )
}
