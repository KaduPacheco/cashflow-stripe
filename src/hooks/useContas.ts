import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useContasTransacoesSinc } from '@/hooks/useContasTransacoesSinc'
import type { ContaPagarReceber, ContasFilters, ContasStats } from '@/types/contas'
import { toast } from 'sonner'

export function useContas() {
  const { user } = useAuth()
  const { criarTransacaoFromConta } = useContasTransacoesSinc()
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

    try {
      // First, update the account
      const contaAtualizada = await updateConta(id, {
        valor_pago: novoValorPago,
        data_pagamento: dataPagamento,
        status: novoStatus
      })

      if (!contaAtualizada) {
        throw new Error('Falha ao atualizar conta')
      }

      // Then, create the corresponding transaction
      const contaCompleta = {
        ...conta,
        ...contaAtualizada
      }

      const transacaoCriada = await criarTransacaoFromConta(contaCompleta, valorPago, dataPagamento)

      if (!transacaoCriada) {
        console.warn('Transação não foi criada, mas pagamento foi registrado')
        toast.warn('Pagamento registrado, mas transação não foi criada automaticamente')
      }

      return contaAtualizada
    } catch (error) {
      console.error('Erro no processo de pagamento:', error)
      toast.error('Erro ao processar pagamento')
      return null
    }
  }

  const pararRecorrencia = async (id: string) => {
    return updateConta(id, {
      recorrencia: 'unica',
      data_proxima_recorrencia: null
    })
  }

  const gerarRecorrencia = async (contaOriginal: ContaPagarReceber) => {
    if (!contaOriginal.data_proxima_recorrencia || contaOriginal.recorrencia === 'unica') {
      return null
    }

    const novaConta = {
      ...contaOriginal,
      id: undefined,
      data_vencimento: contaOriginal.data_proxima_recorrencia,
      valor_pago: 0,
      status: 'pendente' as const,
      data_pagamento: undefined,
      conta_origem_id: contaOriginal.id,
      created_at: undefined,
      updated_at: undefined
    }

    // Calculate next recurrence
    const proximaData = new Date(contaOriginal.data_proxima_recorrencia)
    switch (contaOriginal.recorrencia) {
      case 'mensal':
        proximaData.setMonth(proximaData.getMonth() + 1)
        break
      case 'trimestral':
        proximaData.setMonth(proximaData.getMonth() + 3)
        break
      case 'semestral':
        proximaData.setMonth(proximaData.getMonth() + 6)
        break
      case 'anual':
        proximaData.setFullYear(proximaData.getFullYear() + 1)
        break
    }

    novaConta.data_proxima_recorrencia = proximaData.toISOString().split('T')[0]

    return createConta(novaConta)
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
