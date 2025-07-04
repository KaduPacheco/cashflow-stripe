import { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import { useDebounce } from '@/hooks/useDebounce'
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics'
import { toast } from '@/hooks/use-toast'
import { TrendingUp, TrendingDown, DollarSign, Calendar, Filter, Lightbulb, Lock, FileText } from 'lucide-react'
import { formatCurrency } from '@/utils/currency'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { SubscriptionBanner } from '@/components/subscription/SubscriptionBanner'
import { DashboardMetricsCards } from '@/components/dashboard/DashboardMetricsCards'
import { LembretesDoDiaCard } from '@/components/dashboard/LembretesDoDiaCard'

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

// Paleta de cores para categorias de despesas
const CATEGORY_COLORS = {
  'Habitação': '#6366F1',
  'Alimentação': '#22C55E', 
  'Transporte': '#EAB308',
  'Saúde': '#F97316',
  'Educação': '#10B981',
  'Lazer': '#8B5CF6',
  'Outros': '#F43F5E',
  'default': '#64748B'
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
  
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [lembretes, setLembretes] = useState<Lembrete[]>([])
  const [loading, setLoading] = useState(true)
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth().toString())
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString())
  const [dicaDoDia] = useState(dicas[new Date().getDate() % dicas.length])

  // Calculate stats from transacoes
  const stats: DashboardStats = {
    totalReceitas: transacoes.filter(t => t.tipo === 'receita').reduce((sum, t) => sum + Math.abs(t.valor || 0), 0),
    totalDespesas: transacoes.filter(t => t.tipo === 'despesa').reduce((sum, t) => sum + Math.abs(t.valor || 0), 0),
    saldo: 0, // Will be calculated below
    transacoesCount: transacoes.length,
    lembretesCount: lembretes.length
  }

  // Calculate saldo
  stats.saldo = stats.totalReceitas - stats.totalDespesas

  // Calculate receitas for compatibility
  const receitas = stats.totalReceitas

  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) {
      console.error('❌ Dashboard: No user ID available')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      console.log('🔄 Dashboard: fetchDashboardData acionado', { 
        filterMonth, 
        filterYear, 
        userId: user.id,
        isSubscribed: subscriptionData.subscribed,
        timestamp: new Date().toISOString()
      })

      const startDate = new Date(parseInt(filterYear), parseInt(filterMonth), 1)
      const endDate = new Date(parseInt(filterYear), parseInt(filterMonth) + 1, 0, 23, 59, 59)
      
      console.log('📅 Dashboard: Date range calculated', { startDate, endDate })

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
        console.error('❌ Dashboard: Error fetching transactions:', transacoesError)
        throw transacoesError
      }

      if (lembretesError) {
        console.error('❌ Dashboard: Error fetching lembretes:', lembretesError)
        throw lembretesError
      }

      console.log('📊 Dashboard: Data fetched successfully', {
        transacoesCount: transacoes?.length || 0,
        lembretesCount: lembretes?.length || 0,
        isSubscribed: subscriptionData.subscribed
      })

      setTransacoes(transacoes || [])
      setLembretes(lembretes || [])

    } catch (error: any) {
      console.error('❌ Dashboard: Error loading data:', error)
      toast({
        title: "Erro ao carregar dados",
        description: error.message || "Erro desconhecido ao carregar dados do dashboard",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [filterMonth, filterYear, user?.id, subscriptionData.subscribed])

  const debouncedFetchDashboardData = useDebounce(fetchDashboardData, 300)

  useEffect(() => {
    if (user?.id) {
      console.log('🔄 Dashboard: Initial data load for user:', user.id)
      fetchDashboardData()
    }
  }, [user?.id, filterMonth, filterYear, subscriptionData.subscribed])

  useEffect(() => {
    if (!user?.id) return

    console.log('🔄 Dashboard: Setting up real-time listener for user:', user.id)
    
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
          console.log('⚡ Dashboard: Real-time transaction change detected:', {
            event: payload.eventType,
            table: payload.table,
            userId: user.id,
            timestamp: new Date().toISOString()
          })
          debouncedFetchDashboardData()
        }
      )
      .subscribe((status) => {
        console.log('🔌 Dashboard: Real-time subscription status:', status)
      })

    return () => {
      console.log('🔌 Dashboard: Cleaning up real-time listener')
      supabase.removeChannel(channel)
    }
  }, [user?.id, debouncedFetchDashboardData])

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
    const receitasValue = Math.abs(stats.totalReceitas)
    const data = []

    // Adicionar receitas como uma fatia única
    if (receitasValue > 0) {
      data.push({ 
        name: 'Receitas', 
        value: receitasValue,
        color: '#0F4C81'
      })
    }

    // Adicionar despesas separadas por categoria
    const categoriasDespesas: { [key: string]: number } = {}
    
    transacoes.forEach(t => {
      if (t.categorias?.nome && t.valor && t.tipo === 'despesa') {
        const categoryName = t.categorias.nome
        categoriasDespesas[categoryName] = (categoriasDespesas[categoryName] || 0) + Math.abs(t.valor)
      }
    })

    Object.entries(categoriasDespesas).forEach(([categoria, valor]) => {
      if (valor > 0) {
        data.push({
          name: categoria,
          value: valor,
          color: CATEGORY_COLORS[categoria as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.default
        })
      }
    })

    return data
  }

  const proximoLembrete = lembretes
    .filter(l => l.data && new Date(l.data) >= new Date())
    .sort((a, b) => new Date(a.data!).getTime() - new Date(b.data!).getTime())[0]

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

      <DashboardMetricsCards 
        filterMonth={filterMonth} 
        filterYear={filterYear} 
      />

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
          <LembretesDoDiaCard />

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
              Receitas vs Despesas por Categoria
            </CardTitle>
            <CardDescription>
              Distribuição detalhada entre receitas e categorias de despesas
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {getPieData().length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Sem dados para exibir
              </div>
            ) : (
              <div className="space-y-4">
                <div className="h-[280px] w-full">
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
                        animationDuration={500}
                      >
                        {getPieData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
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
                
                {/* Legenda personalizada */}
                <div className="grid grid-cols-2 gap-2 pt-4 border-t">
                  {getPieData().map((entry, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-card-foreground truncate">
                        {entry.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
