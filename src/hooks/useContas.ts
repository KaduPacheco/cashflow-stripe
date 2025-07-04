
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useContasCrud } from '@/hooks/useContasCrud'
import { useContasRecorrencia } from '@/hooks/useContasRecorrencia'
import { useContasPagamento } from '@/hooks/useContasPagamento'
import { calculateContasStats } from '@/hooks/useContasStats'
import type { ContaPagarReceber, ContasFilters, ContasStats } from '@/types/contas'
import { toast } from 'sonner'

export function useContas() {
  const { user } = useAuth()
  const { createConta, updateConta, deleteConta } = useContasCrud()
  const { pararRecorrencia, gerarRecorrencia } = useContasRecorrencia()
  const { pagarConta, setContas: setPagamentoContas } = useContasPagamento()
  
  const [contas, setContas] = useState<ContaPagarReceber[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<ContasStats>({
    totalAPagar: 0,
    totalAReceber: 0,
    totalVencidas: 0,
    totalPagasNoMes: 0,
    saldoProjetado: 0
  })

  const fetchContas = async (filters: ContasFilters = {}) => {
    if (!user) return

    try {
      setLoading(true)
      
      let query = supabase
        .from('contas_pagar_receber')
        .select(`
          *,
          categorias (
            id,
            nome
          ),
          clientes_fornecedores (
            id,
            nome,
            tipo
          )
        `)
        .eq('user_id', user.id)
        .order('data_vencimento', { ascending: false })

      // Apply filters
      if (filters.tipo) {
        query = query.eq('tipo', filters.tipo)
      }
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.data_inicio) {
        query = query.gte('data_vencimento', filters.data_inicio)
      }
      if (filters.data_fim) {
        query = query.lte('data_vencimento', filters.data_fim)
      }
      if (filters.categoria) {
        query = query.eq('category_id', filters.categoria)
      }
      if (filters.cliente_fornecedor) {
        query = query.eq('cliente_fornecedor_id', filters.cliente_fornecedor)
      }
      if (filters.recorrencia) {
        query = query.eq('recorrencia', filters.recorrencia)
      }
      if (filters.busca) {
        query = query.ilike('descricao', `%${filters.busca}%`)
      }

      const { data, error } = await query

      if (error) {
        console.error('Erro ao carregar contas:', error)
        toast.error('Erro ao carregar contas')
        return
      }

      setContas(data || [])
      setPagamentoContas(data || [])
      setStats(calculateContasStats(data || []))
    } catch (error) {
      console.error('Erro ao carregar contas:', error)
      toast.error('Erro ao carregar contas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContas()
  }, [user])

  return {
    contas,
    loading,
    stats,
    fetchContas,
    createConta,
    updateConta,
    deleteConta,
    pagarConta,
    pararRecorrencia,
    gerarRecorrencia
  }
}
