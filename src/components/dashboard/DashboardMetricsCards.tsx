
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react'
import { DashboardMetricCard } from './DashboardMetricCard'
import { DashboardCardSkeleton } from './DashboardCardSkeleton'
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics'
import { useSubscription } from '@/hooks/useSubscription'
import { motion } from 'framer-motion'

interface DashboardMetricsCardsProps {
  filterMonth: string
  filterYear: string
}

export function DashboardMetricsCards({ filterMonth, filterYear }: DashboardMetricsCardsProps) {
  const { metrics, isLoading, error } = useDashboardMetrics(filterMonth, filterYear)
  const { subscriptionData } = useSubscription()

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <DashboardCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        <div className="col-span-full text-center py-8">
          <p className="text-muted-foreground">Erro ao carregar métricas. Tente novamente.</p>
        </div>
      </motion.div>
    )
  }

  const description = subscriptionData.subscribed ? "Mês atual" : "Últimos registros"

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <DashboardMetricCard
        title="Total de Receitas"
        value={metrics.receitas}
        description={description}
        icon={TrendingUp}
        iconColor="text-emerald-600"
        iconBgColor="bg-emerald-100 dark:bg-emerald-900/20"
        borderColor="border-l-4 border-l-emerald-500"
        valueColor="text-emerald-600"
        delay={0}
        isCurrency={true}
      />

      <DashboardMetricCard
        title="Total de Despesas"
        value={metrics.despesas}
        description={description}
        icon={TrendingDown}
        iconColor="text-red-600"
        iconBgColor="bg-red-100 dark:bg-red-900/20"
        borderColor="border-l-4 border-l-red-500"
        valueColor="text-red-600"
        delay={0.1}
        isCurrency={true}
      />

      <DashboardMetricCard
        title="Saldo Atual"
        value={metrics.saldo}
        description="Receitas - Despesas"
        icon={DollarSign}
        iconColor={metrics.saldo >= 0 ? 'text-primary' : 'text-red-600'}
        iconBgColor={metrics.saldo >= 0 ? 'bg-blue-100 dark:bg-blue-900/20' : 'bg-red-100 dark:bg-red-900/20'}
        borderColor="border-l-4 border-l-primary"
        valueColor={metrics.saldo >= 0 ? 'text-primary' : 'text-red-600'}
        delay={0.2}
        isCurrency={true}
      />

      <DashboardMetricCard
        title="Lembretes Ativos"
        value={metrics.lembretes}
        description="Total de lembretes"
        icon={Calendar}
        iconColor="text-purple-600"
        iconBgColor="bg-purple-100 dark:bg-purple-900/20"
        borderColor="border-l-4 border-l-purple-500"
        valueColor="text-purple-600"
        delay={0.3}
        isCurrency={false}
      />
    </div>
  )
}
