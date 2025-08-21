
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './useAuth'
import { SecureLogger } from '@/lib/logger'

export type UserFilter = 'last7days' | 'last30days' | 'all'
export type CashFlowFilter = 'currentMonth' | 'previousMonth' | 'last12months'

interface AdminMetrics {
  paidUsers: number
  freeUsers: number
  cashFlow: number
  totalUsers: number
  activeSubscribers: number
  premiumUsers: number
}

interface UseAdminMetricsReturn {
  metrics: AdminMetrics
  loading: boolean
  error: string | null
  userFilter: UserFilter
  cashFlowFilter: CashFlowFilter
  setUserFilter: (filter: UserFilter) => void
  setCashFlowFilter: (filter: CashFlowFilter) => void
  refetch: () => void
}

export function useAdminMetrics(): UseAdminMetricsReturn {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState<AdminMetrics>({
    paidUsers: 0,
    freeUsers: 0,
    cashFlow: 0,
    totalUsers: 0,
    activeSubscribers: 0,
    premiumUsers: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userFilter, setUserFilter] = useState<UserFilter>('all')
  const [cashFlowFilter, setCashFlowFilter] = useState<CashFlowFilter>('currentMonth')

  const fetchMetrics = useCallback(async () => {
    // Verificar se é admin antes de buscar dados
    if (user?.email !== 'adm.forteia@gmail.com') {
      setError('Acesso não autorizado')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      SecureLogger.info('Admin metrics: Iniciando busca de métricas', {
        adminEmail: user?.email,
        userFilter,
        cashFlowFilter
      })

      // Calcular datas baseadas nos filtros
      const now = new Date()
      let userDateFilter: string | null = null
      
      if (userFilter === 'last7days') {
        const date = new Date(now)
        date.setDate(date.getDate() - 7)
        userDateFilter = date.toISOString()
      } else if (userFilter === 'last30days') {
        const date = new Date(now)
        date.setDate(date.getDate() - 30)
        userDateFilter = date.toISOString()
      }

      // Buscar usuários pagos
      let paidUsersQuery = supabase
        .from('subscribers')
        .select('user_id', { count: 'exact', head: true })
        .eq('subscribed', true)

      if (userDateFilter) {
        paidUsersQuery = paidUsersQuery.gte('created_at', userDateFilter)
      }

      // Buscar total de usuários (para calcular gratuitos)
      let totalUsersQuery = supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })

      if (userDateFilter) {
        totalUsersQuery = totalUsersQuery.gte('created_at', userDateFilter)
      }

      // Buscar usuários premium (VIP)
      let premiumUsersQuery = supabase
        .from('subscribers')
        .select('user_id', { count: 'exact', head: true })
        .eq('subscribed', true)
        .eq('subscription_tier', 'VIP')

      if (userDateFilter) {
        premiumUsersQuery = premiumUsersQuery.gte('created_at', userDateFilter)
      }

      // Calcular datas para fluxo de caixa
      let cashFlowDateFrom: string
      let cashFlowDateTo: string

      if (cashFlowFilter === 'currentMonth') {
        cashFlowDateFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
        cashFlowDateTo = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()
      } else if (cashFlowFilter === 'previousMonth') {
        cashFlowDateFrom = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
        cashFlowDateTo = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString()
      } else {
        // last12months
        cashFlowDateFrom = new Date(now.getFullYear(), now.getMonth() - 12, 1).toISOString()
        cashFlowDateTo = now.toISOString()
      }

      // Buscar transações para fluxo de caixa
      const cashFlowQuery = supabase
        .from('transacoes')
        .select('tipo, valor')
        .gte('quando', cashFlowDateFrom)
        .lte('quando', cashFlowDateTo)

      const [
        { count: paidUsersCount, error: paidUsersError },
        { count: totalUsersCount, error: totalUsersError },
        { count: premiumUsersCount, error: premiumUsersError },
        { data: transactions, error: transactionsError }
      ] = await Promise.all([
        paidUsersQuery,
        totalUsersQuery,
        premiumUsersQuery,
        cashFlowQuery
      ])

      if (paidUsersError) throw paidUsersError
      if (totalUsersError) throw totalUsersError
      if (premiumUsersError) throw premiumUsersError
      if (transactionsError) throw transactionsError

      // Calcular usuários gratuitos
      const freeUsersCount = (totalUsersCount || 0) - (paidUsersCount || 0)

      // Calcular fluxo de caixa
      const cashFlow = transactions?.reduce((acc, transaction) => {
        const valor = Number(transaction.valor) || 0
        if (transaction.tipo === 'receita') {
          return acc + valor
        } else if (transaction.tipo === 'despesa') {
          return acc - valor
        }
        return acc
      }, 0) || 0

      const newMetrics: AdminMetrics = {
        paidUsers: paidUsersCount || 0,
        freeUsers: Math.max(0, freeUsersCount),
        cashFlow,
        totalUsers: totalUsersCount || 0,
        activeSubscribers: paidUsersCount || 0,
        premiumUsers: premiumUsersCount || 0
      }

      setMetrics(newMetrics)

      SecureLogger.info('Admin metrics: Métricas carregadas com sucesso', {
        metrics: newMetrics,
        userFilter,
        cashFlowFilter
      })

    } catch (err: any) {
      SecureLogger.error('Erro ao carregar métricas administrativas:', err)
      setError(err.message || 'Erro ao carregar métricas')
    } finally {
      setLoading(false)
    }
  }, [user?.email, userFilter, cashFlowFilter])

  useEffect(() => {
    if (user?.email === 'adm.forteia@gmail.com') {
      fetchMetrics()
    }
  }, [user?.email, userFilter, cashFlowFilter, fetchMetrics])

  return {
    metrics,
    loading,
    error,
    userFilter,
    cashFlowFilter,
    setUserFilter,
    setCashFlowFilter,
    refetch: fetchMetrics
  }
}
