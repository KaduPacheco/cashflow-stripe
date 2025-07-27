
import { useEffect } from 'react'
import { useAdmin } from '@/hooks/useAdmin'
import { useAuth } from '@/hooks/useAuth'
import { useAdminMetrics } from '@/hooks/useAdminMetrics'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AdminMetricCard } from '@/components/admin/AdminMetricCard'
import { Users, DollarSign } from 'lucide-react'

export default function AdminDashboard() {
  const { logAdminAction } = useAdmin()
  const { user } = useAuth()
  const {
    metrics,
    loading,
    error,
    userFilter,
    cashFlowFilter,
    setUserFilter,
    setCashFlowFilter
  } = useAdminMetrics()

  useEffect(() => {
    if (user?.email === 'adm.forteia@gmail.com') {
      logAdminAction('admin_dashboard_view')
    }
  }, [user?.email, logAdminAction])

  const userFilterOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'last7days', label: 'Últimos 7 dias' },
    { value: 'last30days', label: 'Últimos 30 dias' }
  ]

  const cashFlowFilterOptions = [
    { value: 'currentMonth', label: 'Mês atual' },
    { value: 'previousMonth', label: 'Mês anterior' },
    { value: 'last12months', label: 'Últimos 12 meses' }
  ]

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Dashboard Administrativo
          </h1>
          <p className="text-gray-400">
            Erro ao carregar dados do sistema
          </p>
        </div>
        <Card className="bg-red-900/20 border-red-800">
          <CardContent className="pt-6">
            <p className="text-red-400">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Dashboard Administrativo
        </h1>
        <p className="text-gray-400">
          Métricas avançadas do sistema Cash Flow
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AdminMetricCard
          title="Usuários Pagos"
          value={metrics.paidUsers}
          icon={Users}
          filterValue={userFilter}
          filterOptions={userFilterOptions}
          onFilterChange={(value) => setUserFilter(value as any)}
          loading={loading}
        />
        
        <AdminMetricCard
          title="Usuários Gratuitos"
          value={metrics.freeUsers}
          icon={Users}
          filterValue={userFilter}
          filterOptions={userFilterOptions}
          onFilterChange={(value) => setUserFilter(value as any)}
          loading={loading}
        />
        
        <AdminMetricCard
          title="Fluxo de Caixa"
          value={metrics.cashFlow}
          icon={DollarSign}
          filterValue={cashFlowFilter}
          filterOptions={cashFlowFilterOptions}
          onFilterChange={(value) => setCashFlowFilter(value as any)}
          loading={loading}
          isCurrency={true}
        />
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Informações do Sistema</CardTitle>
          <CardDescription className="text-gray-400">
            Detalhes técnicos e status do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Versão:</span>
              <span className="text-white">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Ambiente:</span>
              <span className="text-white">Produção</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Última atualização:</span>
              <span className="text-white">Hoje</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
