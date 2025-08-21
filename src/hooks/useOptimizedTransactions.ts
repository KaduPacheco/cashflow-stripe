
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'

export function useOptimizedTransactions(filterMonth: string, filterYear: string) {
  const { user } = useAuth()
  const [receitas, setReceitas] = useState(0)

  useEffect(() => {
    if (!user?.id) return

    const fetch = async () => {
      console.log('🔄 useOptimizedTransactions - Iniciando busca', { 
        filterMonth, 
        filterYear, 
        userId: user.id,
        premiumMode: true // Modo gratuito premium ativado
      })

      const startDate = new Date(parseInt(filterYear), parseInt(filterMonth), 1)
      const endDate = new Date(parseInt(filterYear), parseInt(filterMonth) + 1, 0, 23, 59, 59)

      // Modo gratuito premium: todos os usuários podem filtrar por período
      let query = supabase
        .from('transacoes')
        .select('valor, tipo')
        .eq('userId', user.id)
        .gte('quando', startDate.toISOString().split('T')[0])
        .lte('quando', endDate.toISOString().split('T')[0])

      const { data, error } = await query

      if (error) {
        console.error('❌ useOptimizedTransactions - Erro ao buscar transações:', error)
        return
      }

      const total = data
        ?.filter(t => t.tipo?.toLowerCase() === 'receita')
        .reduce((acc, t) => acc + Math.abs(Number(t.valor) || 0), 0)

      console.log('💰 useOptimizedTransactions - Receitas calculadas:', {
        totalTransacoes: data?.length || 0,
        receitasEncontradas: data?.filter(t => t.tipo?.toLowerCase() === 'receita').length || 0,
        valorTotalReceitas: total || 0,
        premiumMode: true
      })

      setReceitas(total || 0)
    }

    fetch()
  }, [filterMonth, filterYear, user?.id])

  return { receitas }
}
