
import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAdmin } from '@/hooks/useAdmin'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, CreditCard, Bell, Database } from 'lucide-react'
import { SecureLogger } from '@/lib/logger'

interface SystemStats {
  totalUsers: number
  totalTransactions: number
  totalReminders: number
  totalCategories: number
  activeUsers: number
  recentSignups: number
}

export default function AdminDashboard() {
  const { logAdminAction } = useAdmin()
  const { user } = useAuth()
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalTransactions: 0,
    totalReminders: 0,
    totalCategories: 0,
    activeUsers: 0,
    recentSignups: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Verificar se o usuário é admin antes de carregar dados
    if (user?.email === 'adm.forteia@gmail.com') {
      loadSystemStats()
      logAdminAction('admin_dashboard_view')
    } else {
      setError('Acesso não autorizado')
      setLoading(false)
    }
  }, [user?.email, logAdminAction])

  const loadSystemStats = async () => {
    try {
      setLoading(true)
      setError(null)

      SecureLogger.info('Admin dashboard: Iniciando carregamento de estatísticas', {
        adminEmail: user?.email
      })

      // Buscar estatísticas do sistema com o cliente correto
      const [
        { count: totalUsers, error: usersError },
        { count: totalTransactions, error: transactionsError },
        { count: totalReminders, error: remindersError },
        { count: totalCategories, error: categoriesError }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('transacoes').select('*', { count: 'exact', head: true }),
        supabase.from('lembretes').select('*', { count: 'exact', head: true }),
        supabase.from('categorias').select('*', { count: 'exact', head: true })
      ])

      // Verificar erros nas consultas
      if (usersError) {
        SecureLogger.error('Erro ao buscar usuários:', usersError)
        throw usersError
      }
      if (transactionsError) {
        SecureLogger.error('Erro ao buscar transações:', transactionsError)
        throw transactionsError
      }
      if (remindersError) {
        SecureLogger.error('Erro ao buscar lembretes:', remindersError)
        throw remindersError
      }
      if (categoriesError) {
        SecureLogger.error('Erro ao buscar categorias:', categoriesError)
        throw categoriesError
      }

      // Usuários ativos (com updated_at nos últimos 30 dias)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const { count: activeUsers, error: activeUsersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', thirtyDaysAgo.toISOString())

      if (activeUsersError) {
        SecureLogger.error('Erro ao buscar usuários ativos:', activeUsersError)
        throw activeUsersError
      }

      // Novos usuários (últimos 7 dias)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      const { count: recentSignups, error: recentSignupsError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString())

      if (recentSignupsError) {
        SecureLogger.error('Erro ao buscar novos usuários:', recentSignupsError)
        throw recentSignupsError
      }

      const newStats: SystemStats = {
        totalUsers: totalUsers || 0,
        totalTransactions: totalTransactions || 0,
        totalReminders: totalReminders || 0,
        totalCategories: totalCategories || 0,
        activeUsers: activeUsers || 0,
        recentSignups: recentSignups || 0
      }

      setStats(newStats)

      SecureLogger.info('Admin dashboard: Estatísticas carregadas com sucesso', {
        stats: newStats
      })

    } catch (error: any) {
      SecureLogger.error('Erro ao carregar estatísticas do sistema:', error)
      setError(error.message || 'Erro ao carregar dados do sistema')
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, description, icon: Icon }: {
    title: string
    value: number
    description: string
    icon: any
  }) => (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-200">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">
          {loading ? '...' : value.toLocaleString()}
        </div>
        <p className="text-xs text-gray-400">
          {description}
        </p>
      </CardContent>
    </Card>
  )

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
          Visão geral do sistema Cash Flow
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Usuários"
          value={stats.totalUsers}
          description="Usuários cadastrados"
          icon={Users}
        />
        <StatCard
          title="Transações"
          value={stats.totalTransactions}
          description="Total de transações"
          icon={CreditCard}
        />
        <StatCard
          title="Lembretes"
          value={stats.totalReminders}
          description="Lembretes criados"
          icon={Bell}
        />
        <StatCard
          title="Categorias"
          value={stats.totalCategories}
          description="Categorias criadas"
          icon={Database}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          title="Usuários Ativos"
          value={stats.activeUsers}
          description="Últimos 30 dias"
          icon={Users}
        />
        <StatCard
          title="Novos Usuários"
          value={stats.recentSignups}
          description="Últimos 7 dias"
          icon={Users}
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
