import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import { useOptimizedTransactions } from '@/hooks/useOptimizedTransactions'
import { toast } from '@/hooks/use-toast'
import { TrendingUp, TrendingDown, DollarSign, Calendar, Filter, Lightbulb, Lock } from 'lucide-react'
import { formatCurrency } from '@/utils/currency'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { SubscriptionBanner } from '@/components/subscription/SubscriptionBanner'

interface DashboardStats {
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

const COLORS = ['#4361ee', '#7209b7', '#f72585', '#4cc9f0', '#4895ef', '#4361ee']

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

  // Now we can use the hook after filterMonth and filterYear are declared
  const { receitas } = useOptimizedTransactions(filterMonth, filterYear)

  useEffect(() => {
    if (user?.id) {
      console.log('Dashboard: Loading data for user:', user.id)
      fetchDashboardData()
    }
  }, [user?.id, filterMonth, filterYear])

  // Listener para mudanças em tempo real - movido para cima e corrigido
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
          // Recarregar dados quando houver mudanças
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

      // Criar datas de início e fim do período
      const startDate = new Date(parseInt(filterYear), parseInt(filterMonth), 1)
      const endDate = new Date(parseInt(filterYear), parseInt(filterMonth) + 1, 0, 23, 59, 59)
      
      console.log('Dashboard: Date range:', { startDate, endDate })

      // Para usuários sem assinatura, limitar aos últimos 30 dias
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
        // Usuários assinantes podem filtrar por período
        transacoesQuery = transacoesQuery
          .gte('quando', startDate.toISOString().split('T')[0])
          .lte('quando', endDate.toISOString().split('T')[0])
        
        lembretesQuery = lembretesQuery
          .gte('data', startDate.toISOString().split('T')[0])
          .lte('data', endDate.toISOString().split('T')[0])
      } else {
        // Usuários gratuitos veem apenas últimos 5 registros
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

      setTransacoes(transacoes || [])
      setLembretes(lembretes || [])

      // Calcular apenas despesas - receitas vem do hook
      const despesas = transacoes?.filter(t => t.tipo === 'despesa').reduce((sum, t) => {
        const valor = Number(t.valor) || 0
        console.log('Dashboard: Adding despesa:', valor)
        return sum + Math.abs(valor)
      }, 0) || 0

      const newStats = {
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

  const getChartData = () => {
    const categorias: { [key: string]: number } = {}
    
    transacoes.forEach(t => {
      if (t.categorias?.nome && t.valor && t.tipo === 'despesa') {
        const categoryName = t.categorias.nome
        categorias[categoryName] = (categorias[categoryName] || 0) + Math.abs(t.valor)
      }
    })

    return Object.entries(categorias).map(([categoria, valor]) => ({
      categoria,
      valor
    }))
  }

  const getPieData = () => {
    const despesas = transacoes.filter(t => t.tipo === 'despesa').reduce((sum, t) => sum + (t.valor || 0), 0)

    return [
      { name: 'Receitas', value: receitas },
      { name: 'Despesas', value: Math.abs(despesas) }
    ]
  }

  const proximoLembrete = lembretes
    .filter(l => l.data && new Date(l.data) >= new Date())
    .sort((a, b) => new Date(a.data!).getTime() - new Date(b.data!).getTime())[0]

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Dashboard</h2>
            <p className="text-muted-foreground mt-2">Carregando suas finanças pessoais...</p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse modern-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded-lg w-20 shimmer"></div>
                <div className="h-4 w-4 bg-muted rounded-full shimmer"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded-lg w-24 mb-2 shimmer"></div>
                <div className="h-3 bg-muted rounded-lg w-32 shimmer"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Show error state if no user
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
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Dashboard
          </h2>
          <p className="text-muted-foreground text-lg">
            Visão geral das suas finanças pessoais
            {transacoes.length > 0 && ` • ${transacoes.length} transações encontradas`}
            {!subscriptionData.subscribed && " • Versão gratuita (últimos 5 registros)"}
          </p>
        </div>
        
        {subscriptionData.subscribed ? (
          <div className="flex gap-3 items-center bg-card/50 backdrop-blur-sm rounded-2xl p-3 border border-border/50">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger className="w-36 rounded-xl border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()} className="rounded-lg">
                    {new Date(0, i).toLocaleDateString('pt-BR', { month: 'long' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="w-28 rounded-xl border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - 2 + i
                  return (
                    <SelectItem key={year} value={year.toString()} className="rounded-lg">
                      {year}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground bg-muted/50 px-4 py-2 rounded-2xl">
            <Lock className="h-4 w-4" />
            <span className="text-sm">Filtros disponíveis com assinatura</span>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-emerald-500 modern-card hover-lift animate-slide-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Receitas
            </CardTitle>
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600 mb-1">
              {formatCurrency(receitas)}
            </div>
            <p className="text-xs text-muted-foreground">
              {subscriptionData.subscribed ? "Mês atual" : "Últimos registros"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 modern-card hover-lift animate-slide-in" style={{animationDelay: '0.1s'}}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Despesas
            </CardTitle>
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-xl">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 mb-1">
              {formatCurrency(stats.totalDespesas)}
            </div>
            <p className="text-xs text-muted-foreground">
              {subscriptionData.subscribed ? "Mês atual" : "Últimos registros"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary modern-card hover-lift animate-slide-in" style={{animationDelay: '0.2s'}}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Saldo Atual
            </CardTitle>
            <div className={`p-2 rounded-xl ${stats.saldo >= 0 ? 'bg-blue-100 dark:bg-blue-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
              <DollarSign className={`h-5 w-5 ${stats.saldo >= 0 ? 'text-primary' : 'text-red-600'}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold mb-1 ${stats.saldo >= 0 ? 'text-primary' : 'text-red-600'}`}>
              {formatCurrency(stats.saldo)}
            </div>
            <p className="text-xs text-muted-foreground">
              Receitas - Despesas
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 modern-card hover-lift animate-slide-in" style={{animationDelay: '0.3s'}}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lembretes Ativos
            </CardTitle>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 mb-1">
              {stats.lembretesCount}
            </div>
            <p className="text-xs text-muted-foreground">
              {subscriptionData.subscribed ? "Este mês" : "Próximos"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2 modern-card animate-scale-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-primary/10 rounded-xl">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              Gastos por Categoria
              {!subscriptionData.subscribed && <Lock className="h-4 w-4 text-muted-foreground" />}
            </CardTitle>
            <CardDescription className="text-base">
              {subscriptionData.subscribed 
                ? "Distribuição dos seus gastos no período selecionado"
                : "Distribuição dos últimos gastos registrados"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[320px] rounded-xl overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="categoria" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="valor" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="modern-card animate-slide-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                Próximo Lembrete
              </CardTitle>
            </CardHeader>
            <CardContent>
              {proximoLembrete ? (
                <div className="space-y-3">
                  <p className="font-medium text-card-foreground">{proximoLembrete.descricao}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(proximoLembrete.data!).toLocaleDateString('pt-BR')}
                  </div>
                  {proximoLembrete.valor && (
                    <div className="text-lg font-semibold text-primary">
                      {formatCurrency(proximoLembrete.valor)}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="p-3 bg-muted/50 rounded-xl mb-3 w-fit mx-auto">
                    <Calendar className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">Nenhum lembrete próximo</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="modern-card animate-slide-in" style={{animationDelay: '0.2s'}}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-xl">
                  <Lightbulb className="h-5 w-5 text-amber-600" />
                </div>
                Dica do Dia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-card-foreground bg-gradient-to-r from-primary/5 to-blue-600/5 p-4 rounded-xl border border-primary/10">
                {dicaDoDia}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="modern-card animate-scale-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-xl">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              Receitas vs Despesas
            </CardTitle>
            <CardDescription>
              Proporção entre receitas e despesas do período
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[240px] rounded-xl overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getPieData()}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                  >
                    {getPieData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

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
      </div>
    </div>
  )
}
