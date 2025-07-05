
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import { useDebounce } from '@/hooks/useDebounce'
import { toast } from '@/hooks/use-toast'
import { Transacao, Lembrete, DashboardStats } from '@/types/dashboard'

interface UseDashboardDataReturn {
  transacoes: Transacao[]
  lembretes: Lembrete[]
  stats: DashboardStats
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useDashboardData(filterMonth: string, filterYear: string): UseDashboardDataReturn {
  const { user } = useAuth()
  const { subscriptionData, loading: subscriptionLoading } = useSubscription()
  
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [lembretes, setLembretes] = useState<Lembrete[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Calculate stats from transacoes
  const stats: DashboardStats = {
    totalReceitas: transacoes.filter(t => t.tipo === 'receita').reduce((sum, t) => sum + Math.abs(t.valor || 0), 0),
    totalDespesas: transacoes.filter(t => t.tipo === 'despesa').reduce((sum, t) => sum + Math.abs(t.valor || 0), 0),
    saldo: 0,
    transacoesCount: transacoes.length,
    lembretesCount: lembretes.length
  }

  stats.saldo = stats.totalReceitas - stats.totalDespesas

  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) {
      console.error('❌ Dashboard: No user ID available')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
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

      // First fetch transactions
      let transacoesQuery = supabase
        .from('transacoes')
        .select('*')
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

      const [transacoesResult, lembretesResult] = await Promise.all([
        transacoesQuery,
        lembretesQuery
      ])

      if (transacoesResult.error) {
        console.error('❌ Dashboard: Error fetching transactions:', transacoesResult.error)
        throw transacoesResult.error
      }

      if (lembretesResult.error) {
        console.error('❌ Dashboard: Error fetching lembretes:', lembretesResult.error)
        throw lembretesResult.error
      }

      // Now fetch categories for each transaction
      const transacoesWithCategories: Transacao[] = []
      
      if (transacoesResult.data && transacoesResult.data.length > 0) {
        for (const transacao of transacoesResult.data) {
          let transacaoWithCategory: Transacao = { ...transacao }
          
          if (transacao.category_id) {
            try {
              const { data: categoria } = await supabase
                .from('categorias')
                .select('id, nome')
                .eq('id', transacao.category_id)
                .eq('userid', user.id)
                .maybeSingle()
              
              if (categoria) {
                transacaoWithCategory.categorias = categoria
              }
            } catch (error) {
              console.warn('Warning: Could not fetch category for transaction', transacao.id, error)
            }
          }
          
          transacoesWithCategories.push(transacaoWithCategory)
        }
      }

      console.log('📊 Dashboard: Data fetched successfully', {
        transacoesCount: transacoesWithCategories.length || 0,
        lembretesCount: lembretesResult.data?.length || 0,
        isSubscribed: subscriptionData.subscribed
      })

      setTransacoes(transacoesWithCategories)
      setLembretes(lembretesResult.data || [])

    } catch (error: any) {
      console.error('❌ Dashboard: Error loading data:', error)
      setError(error.message || "Erro desconhecido ao carregar dados do dashboard")
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
    if (user?.id && !subscriptionLoading) {
      console.log('🔄 Dashboard: Initial data load for user:', user.id)
      fetchDashboardData()
    }
  }, [user?.id, filterMonth, filterYear, subscriptionData.subscribed, subscriptionLoading])

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
    stats,
    loading,
    error,
    refetch: fetchDashboardData
  }
}
