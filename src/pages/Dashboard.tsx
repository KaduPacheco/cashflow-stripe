
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { EmptyState } from '@/components/ui/empty-state'
import { FileText } from 'lucide-react'
import { SubscriptionBanner } from '@/components/subscription/SubscriptionBanner'
import { DashboardMetricsCards } from '@/components/dashboard/DashboardMetricsCards'
import { LembretesDoDiaCard } from '@/components/dashboard/LembretesDoDiaCard'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { DashboardCharts } from '@/components/dashboard/DashboardCharts'
import { DashboardSummary } from '@/components/dashboard/DashboardSummary'
import { DashboardTipCard } from '@/components/dashboard/DashboardTipCard'
import { useDashboardData } from '@/hooks/useDashboardData'
import { dicas } from '@/types/dashboard'

export default function Dashboard() {
  const { user } = useAuth()
  const { subscriptionData, loading: subscriptionLoading } = useSubscription()
  
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth().toString())
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString())
  const [dicaDoDia] = useState(dicas[new Date().getDate() % dicas.length])

  const { transacoes, lembretes, stats, loading, error, refetch } = useDashboardData(filterMonth, filterYear)

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

  if (loading || subscriptionLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <EmptyState
          icon={<FileText className="h-12 w-12" />}
          title="Erro ao carregar dashboard"
          description={error}
          action={{
            label: "Tentar novamente",
            onClick: () => refetch()
          }}
        />
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="space-y-8 animate-fade-in">
        <SubscriptionBanner />
        
        <DashboardHeader
          transactionsCount={transacoes.length}
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

        <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
          <DashboardCharts 
            transacoes={transacoes}
            stats={stats}
            isSubscribed={subscriptionData.subscribed}
          />

          <div className="space-y-6">
            <LembretesDoDiaCard />
            <DashboardTipCard tip={dicaDoDia} />
          </div>
        </div>

        <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
          <DashboardSummary stats={stats} />
        </div>
      </div>
    </ErrorBoundary>
  )
}
