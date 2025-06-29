
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import { useSubscription } from './useSubscription'
import { useDebounce } from './useDebounce'

interface DashboardMetrics {
  receitas: number
  despesas: number
  saldo: number
  lembretes: number
}

interface UseDashboardMetricsReturn {
  metrics: DashboardMetrics
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useDashboardMetrics(filterMonth: string, filterYear: string): UseDashboardMetricsReturn {
  const { user } = useAuth()
  const { subscriptionData } = useSubscription()
  
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    receitas: 0,
    despesas: 0,
    saldo: 0,
    lembretes: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      console.log('🔄 useDashboardMetrics - Iniciando busca', { 
        filterMonth, 
        filterYear, 
        userId: user.id,
        isSubscribed: subscriptionData.subscribed
      })

      const startDate = new Date(parseInt(filterYear), parseInt(filterMonth), 1)
      const endDate = new Date(parseInt(filterYear), parseInt(filterMonth) + 1, 0, 23, 59, 59)

      // Query para transações
      let transacoesQuery = supabase
        .from('transacoes')
        .select('valor, tipo')
        .eq('userId', user.id)

      // Query para lembretes
      let lembretesQuery = supabase
        .from('lembretes')
        .select('id')
        .eq('userId', user.id)

      if (subscriptionData.subscribed) {
        // Usuários assinantes podem filtrar por período
        transacoesQuery = transacoesQuery
          .gte('quando', startDate.toISOString().split('T')[0])
          .lte('quando', endDate.toISOString().split('T')[0])
        
        lembretesQuery = lembretesQuery
          .gte('data', startDate.toISOString().split('T')[0])
          .lte('data', endDate.toISOString().split('T')[0])
      } else {
        // Usuários gratuitos veem apenas últimos registros
        transacoesQuery = transacoesQuery.limit(5)
        lembretesQuery = lembretesQuery.limit(3)
      }

      const [{ data: transacoes, error: transacoesError }, { data: lembretes, error: lembretesError }] = 
        await Promise.all([transacoesQuery, lembretesQuery])

      if (transacoesError) throw transacoesError
      if (lembretesError) throw lembretesError

      // Calcular métricas
      const receitas = transacoes?.filter(t => t.tipo === 'receita').reduce((sum, t) => {
        const valor = Number(t.valor) || 0
        return sum + Math.abs(valor)
      }, 0) || 0

      const despesas = transacoes?.filter(t => t.tipo === 'despesa').reduce((sum, t) => {
        const valor = Number(t.valor) || 0
        return sum + Math.abs(valor)
      }, 0) || 0

      const newMetrics: DashboardMetrics = {
        receitas,
        despesas,
        saldo: receitas - despesas,
        lembretes: lembretes?.length || 0
      }

      console.log('📊 useDashboardMetrics - Dados calculados:', newMetrics)

      setMetrics(newMetrics)
    } catch (err: any) {
      console.error('❌ useDashboardMetrics - Erro:', err)
      setError(err.message || 'Erro ao carregar métricas')
    } finally {
      setIsLoading(false)
    }
  }, [filterMonth, filterYear, user?.id, subscriptionData.subscribed])

  const debouncedFetchMetrics = useDebounce(fetchMetrics, 300)

  useEffect(() => {
    if (user?.id) {
      fetchMetrics()
    }
  }, [user?.id, filterMonth, filterYear, subscriptionData.subscribed])

  // Listener para mudanças em tempo real
  useEffect(() => {
    if (!user?.id) return

    console.log('🔄 useDashboardMetrics - Configurando listener tempo real')
    
    const channel = supabase
      .channel('dashboard-metrics-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transacoes',
          filter: `userId=eq.${user.id}`
        },
        (payload) => {
          console.log('⚡ useDashboardMetrics - Mudança tempo real detectada:', payload.eventType)
          debouncedFetchMetrics()
        }
      )
      .subscribe()

    return () => {
      console.log('🔌 useDashboardMetrics - Limpando listener')
      supabase.removeChannel(channel)
    }
  }, [user?.id, debouncedFetchMetrics])

  return {
    metrics,
    isLoading,
    error,
    refetch: fetchMetrics
  }
}
