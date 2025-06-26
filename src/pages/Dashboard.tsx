
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import { toast } from '@/hooks/use-toast'
import { SubscriptionBanner } from '@/components/subscription/SubscriptionBanner'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { DashboardFilters } from '@/components/dashboard/DashboardFilters'
import { DashboardCharts } from '@/components/dashboard/DashboardCharts'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { DashboardSummary } from '@/components/dashboard/DashboardSummary'

interface DashboardStats {
  totalReceitas: number
  totalDespesas: number
  saldo: number
  transacoesCount: number
  lembretesCount: number
}

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

interface Lembrete {
  id: number
  created_at: string
  userId: string | null
  descricao: string | null
  data: string | null
  valor: number | null
}

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
  const [stats, setStats] = useState<DashboardStats>({
    totalReceitas: 0,
    totalDespesas: 0,
    saldo: 0,
    transacoesCount: 0,
    lembretesCount: 0,
  })
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [lembretes, setLembretes] = useState<Lembrete[]>([])
  const [loading, setLoading] = useState(true)
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth().toString())
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString())
  const [dicaDoDia] = useState(dicas[new Date().getDate() % dicas.length])

  useEffect(() => {
    if (user?.id) {
      console.log('Dashboard: Loading data for user:', user.id)
      fetchDashboardData()
    }
  }, [user?.id, filterMonth, filterYear])

  // Real-time listener
  useEffect(() => {
    if (!user?.id) return

    console.log('Dashboard: Setting up real-time listener for user:', user.id)
    
    const channel = supabase
      .channel('dashboard-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transacoes',
          filter: `userId=eq.${user.id}`
        },
        (payload) => {
          console.log('Dashboard: Real-time transaction change detected:', payload)
          fetchDashboardData()
        }
      )
      .subscribe((status) => {
        console.log('Dashboard: Real-time subscription status:', status)
      })

    return () => {
      console.log('Dashboard: Cleaning up real-time listener')
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  const fetchDashboardData = async () => {
    if (!user?.id) {
      console.error('Dashboard: No user ID available')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      console.log('Dashboard: Fetching data for filters:', { month: filterMonth, year: filterYear })

      const startDate = new Date(parseInt(filterYear), parseInt(filterMonth), 1)
      const endDate = new Date(parseInt(filterYear), parseInt(filterMonth) + 1, 0, 23, 59, 59)
      
      console.log('Dashboard: Date range:', { startDate, endDate })

      let transacoesQuery = supabase
        .from('transacoes')
        .select(`
          *,
          categorias (
            id,
            nome
          )
        `)
        .eq('userId', user.id)
        .order('quando', { ascending: false })

      let lembretesQuery = supabase
        .from('lembretes')
        .select('*')
        .eq('userId', user.id)
        .order('data', { ascending: true })

      if (subscriptionData.subscribed) {
        transacoesQuery = transacoesQuery
          .gte('quando', startDate.toISOString().split('T')[0])
          .lte('quando', endDate.toISOString().split('T')[0])
        
        lembretesQuery = lembretesQuery
          .gte('data', startDate.toISOString().split('T')[0])
          .lte('data', endDate.toISOString().split('T')[0])
      } else {
        transacoesQuery = transacoesQuery.limit(5)
        lembretesQuery = lembretesQuery.limit(3)
      }

      const { data: transacoes, error: transacoesError } = await transacoesQuery
      const { data: lembretes, error: lembretesError } = await lembretesQuery

      if (transacoesError) {
        console.error('Dashboard: Error fetching transactions:', transacoesError)
        throw transacoesError
      }

      if (lembretesError) {
        console.error('Dashboard: Error fetching lembretes:', lembretesError)
        throw lembretesError
      }

      console.log('Dashboard: Transactions fetched:', transacoes?.length || 0)
      console.log('Dashboard: Lembretes fetched:', lembretes?.length || 0)

      const tiposEncontrados = transacoes?.map(t => t.tipo).filter(Boolean)
      console.log('Dashboard: Tipos encontrados nas transações:', [...new Set(tiposEncontrados)])

      setTransacoes(transacoes || [])
      setLembretes(lembretes || [])

      const receitas = transacoes?.filter(t => t.tipo?.toLowerCase() === 'receita').reduce((sum, t) => {
        const valor = Number(t.valor) || 0
        const valorAbsoluto = Math.abs(valor)
        console.log('Dashboard: Adding receita:', valorAbsoluto, 'from transaction:', t.estabelecimento)
        return sum + valorAbsoluto
      }, 0) || 0
      
      const despesas = transacoes?.filter(t => t.tipo?.toLowerCase() === 'despesa').reduce((sum, t) => {
        const valor = Number(t.valor) || 0
        console.log('Dashboard: Adding despesa:', Math.abs(valor), 'from transaction:', t.estabelecimento)
        return sum + Math.abs(valor)
      }, 0) || 0

      const newStats = {
        totalReceitas: receitas,
        totalDespesas: despesas,
        saldo: receitas - despesas,
        transacoesCount: transacoes?.length || 0,
        lembretesCount: lembretes?.length || 0,
      }

      console.log('Dashboard: Calculated stats:', newStats)
      setStats(newStats)

    } catch (error: any) {
      console.error('Dashboard: Error loading data:', error)
      toast({
        title: "Erro ao carregar dados",
        description: error.message || "Erro desconhecido ao carregar dados do dashboard",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">Carregando suas finanças pessoais...</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-muted rounded-lg h-32" />
          ))}
        </div>
      </div>
    )
  }

  if (!user?.id) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-2xl font-bold text-muted-foreground mb-2">Usuário não encontrado</h2>
          <p className="text-muted-foreground">Faça login para visualizar seu dashboard</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SubscriptionBanner />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Visão geral das suas finanças pessoais
            {transacoes.length > 0 && ` • ${transacoes.length} transações encontradas`}
            {!subscriptionData.subscribed && " • Versão gratuita (últimos 5 registros)"}
          </p>
        </div>
        
        <DashboardFilters 
          subscribed={subscriptionData.subscribed}
          filterMonth={filterMonth}
          setFilterMonth={setFilterMonth}
          filterYear={filterYear}
          setFilterYear={setFilterYear}
        />
      </div>

      <DashboardStats stats={stats} subscribed={subscriptionData.subscribed} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardCharts 
            transacoes={transacoes} 
            subscribed={subscriptionData.subscribed}
            stats={stats}
          />
        </div>
        
        <DashboardSidebar lembretes={lembretes} dicaDoDia={dicaDoDia} />
      </div>

      <DashboardSummary stats={stats} />
    </div>
  )
}
