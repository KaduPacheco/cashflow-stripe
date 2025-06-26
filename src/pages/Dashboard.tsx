import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import { toast } from '@/hooks/use-toast'
import { TrendingUp, TrendingDown, DollarSign, Calendar, Filter, Lightbulb, Lock } from 'lucide-react'
import { formatCurrency } from '@/utils/currency'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { SubscriptionBanner } from '@/components/subscription/SubscriptionBanner'

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

      // Log temporário para auditoria dos tipos encontrados
      const tiposEncontrados = transacoes?.map(t => t.tipo).filter(Boolean)
      console.log('Dashboard: Tipos encontrados nas transações:', [...new Set(tiposEncontrados)])

      setTransacoes(transacoes || [])
      setLembretes(lembretes || [])

      // Calcular estatísticas - corrigido com case-insensitive e conversão adequada
      const receitas = transacoes?.filter(t => t.tipo?.toLowerCase() === 'receita').reduce((sum, t) => {
        const valor = Number(t.valor) || 0
        console.log('Dashboard: Adding receita:', valor, 'from transaction:', t.estabelecimento)
        return sum + valor
      }, 0) || 0
      
      const despesas = transacoes?.filter(t => t.tipo?.toLowerCase() === 'despesa').reduce((sum, t) => {
        const valor = Number(t.valor) || 0
        console.log('Dashboard: Adding despesa:', valor, 'from transaction:', t.estabelecimento)
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

  const getChartData = () => {
    const categorias: { [key: string]: number } = {}
    
    transacoes.forEach(t => {
      if (t.categorias?.nome && t.valor && t.tipo?.toLowerCase() === 'despesa') {
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
    const receitas = transacoes.filter(t => t.tipo?.toLowerCase() === 'receita').reduce((sum, t) => sum + (Number(t.valor) || 0), 0)
    const despesas = transacoes.filter(t => t.tipo?.toLowerCase() === 'despesa').reduce((sum, t) => sum + (Number(t.valor) || 0), 0)

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
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">Carregando suas finanças pessoais...</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-20"></div>
                <div className="h-4 w-4 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-24 mb-2"></div>
                <div className="h-3 bg-muted rounded w-32"></div>
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
        
        {subscriptionData.subscribed ? (
          <div className="flex gap-2 items-center">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {new Date(0, i).toLocaleDateString('pt-BR', { month: 'long' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - 2 + i
                  return (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span className="text-sm">Filtros disponíveis com assinatura</span>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Receitas
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.totalReceitas > 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
              {formatCurrency(stats.totalReceitas)}
            </div>
            <p className="text-xs text-muted-foreground">
              {subscriptionData.subscribed ? "Mês atual" : "Últimos registros"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Despesas
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats.totalDespesas)}
            </div>
            <p className="text-xs text-muted-foreground">
              {subscriptionData.subscribed ? "Mês atual" : "Últimos registros"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Saldo Atual
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.saldo >= 0 ? 'text-primary' : 'text-red-600'}`}>
              {formatCurrency(stats.saldo)}
            </div>
            <p className="text-xs text-muted-foreground">
              Receitas - Despesas
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Lembretes Ativos
            </CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.lembretesCount}
            </div>
            <p className="text-xs text-muted-foreground">
              {subscriptionData.subscribed ? "Este mês" : "Próximos"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Gastos por Categoria
              {!subscriptionData.subscribed && <Lock className="h-4 w-4 text-muted-foreground" />}
            </CardTitle>
            <CardDescription>
              {subscriptionData.subscribed 
                ? "Distribuição dos seus gastos no período selecionado"
                : "Distribuição dos últimos gastos registrados"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="categoria" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="valor" fill="#4361ee" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Próximo Lembrete
              </CardTitle>
            </CardHeader>
            <CardContent>
              {proximoLembrete ? (
                <div className="space-y-2">
                  <p className="font-medium">{proximoLembrete.descricao}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(proximoLembrete.data!).toLocaleDateString('pt-BR')}
                  </p>
                  {proximoLembrete.valor && (
                    <p className="text-sm font-medium text-primary">
                      {formatCurrency(proximoLembrete.valor)}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhum lembrete próximo</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Dica do Dia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{dicaDoDia}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Receitas vs Despesas</CardTitle>
            <CardDescription>
              Proporção entre receitas e despesas do período
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getPieData()}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                  >
                    {getPieData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

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
      </div>
    </div>
  )
}
