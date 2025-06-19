
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { ContaPagarReceber, ContasFilters, ContasStats } from '@/types/contas'
import { toast } from 'sonner'

export function useContas() {
  const { user } = useAuth()
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

      // Aplicar filtros
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
      calculateStats(data || [])
    } catch (error) {
      console.error('Erro ao carregar contas:', error)
      toast.error('Erro ao carregar contas')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (contasData: ContaPagarReceber[]) => {
    const hoje = new Date()
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)

    const totalAPagar = contasData
      .filter(c => c.tipo === 'pagar' && c.status !== 'pago' && c.status !== 'cancelado')
      .reduce((sum, c) => sum + (c.valor - c.valor_pago), 0)

    const totalAReceber = contasData
      .filter(c => c.tipo === 'receber' && c.status !== 'pago' && c.status !== 'cancelado')
      .reduce((sum, c) => sum + (c.valor - c.valor_pago), 0)

    const totalVencidas = contasData
      .filter(c => {
        const dataVencimento = new Date(c.data_vencimento)
        return dataVencimento < hoje && c.status !== 'pago' && c.status !== 'cancelado'
      })
      .reduce((sum, c) => sum + (c.valor - c.valor_pago), 0)

    const totalPagasNoMes = contasData
      .filter(c => {
        if (!c.data_pagamento) return false
        const dataPagamento = new Date(c.data_pagamento)
        return dataPagamento >= inicioMes && dataPagamento <= fimMes
      })
      .reduce((sum, c) => sum + c.valor_pago, 0)

    const saldoProjetado = totalAReceber - totalAPagar

    setStats({
      totalAPagar,
      totalAReceber,
      totalVencidas,
      totalPagasNoMes,
      saldoProjetado
    })
  }

  const createConta = async (conta: Omit<ContaPagarReceber, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('contas_pagar_receber')
        .insert({
          ...conta,
          user_id: user.id
        })
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar conta:', error)
        toast.error('Erro ao criar conta')
        return null
      }

      toast.success('Conta criada com sucesso!')
      fetchContas()
      return data
    } catch (error) {
      console.error('Erro ao criar conta:', error)
      toast.error('Erro ao criar conta')
      return null
    }
  }

  const updateConta = async (id: string, updates: Partial<ContaPagarReceber>) => {
    try {
      const { data, error } = await supabase
        .from('contas_pagar_receber')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Erro ao atualizar conta:', error)
        toast.error('Erro ao atualizar conta')
        return null
      }

      toast.success('Conta atualizada com sucesso!')
      fetchContas()
      return data
    } catch (error) {
      console.error('Erro ao atualizar conta:', error)
      toast.error('Erro ao atualizar conta')
      return null
    }
  }

  const deleteConta = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contas_pagar_receber')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Erro ao deletar conta:', error)
        toast.error('Erro ao deletar conta')
        return false
      }

      toast.success('Conta deletada com sucesso!')
      fetchContas()
      return true
    } catch (error) {
      console.error('Erro ao deletar conta:', error)
      toast.error('Erro ao deletar conta')
      return false
    }
  }

  const pagarConta = async (id: string, valorPago: number, dataPagamento: string) => {
    const conta = contas.find(c => c.id === id)
    if (!conta) return

    const novoValorPago = conta.valor_pago + valorPago
    const novoStatus = novoValorPago >= conta.valor ? 'pago' : 'parcialmente_pago'

    return updateConta(id, {
      valor_pago: novoValorPago,
      data_pagamento: dataPagamento,
      status: novoStatus
    })
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
    pagarConta
  }
}
