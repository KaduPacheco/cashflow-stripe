
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import { useDebounce } from '@/hooks/useDebounce'
import { toast } from '@/hooks/use-toast'

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

interface DashboardStats {
  totalReceitas: number
  totalDespesas: number
  saldo: number
  transacoesCount: number
  lembretesCount: number
}

export function useDashboardData(filterMonth: string, filterYear: string) {
  const { user } = useAuth()
  const { subscriptionData } = useSubscription()
  
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [lembretes, setLembretes] = useState<Lembrete[]>([])
  const [loading, setLoading] = useState(true)

  // Calculate stats from transacoes
  const stats: DashboardStats = {
    totalReceitas: transacoes.filter(t => t.tipo === 'receita').reduce((sum, t) => sum + Math.abs(t.valor || 0), 0),
    totalDespesas: transacoes.filter(t => t.tipo === 'despesa').reduce((sum, t) => sum + Math.abs(t.valor || 0), 0),
    saldo: 0,
    transacoesCount: transacoes.length,
    lembretesCount: lembretes.length
  }

  stats.saldo = stats.totalReceitas - stats.totalDespesas
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

  return {
    transacoes,
    lembretes,
    loading,
    stats,
    receitas
  }
}
