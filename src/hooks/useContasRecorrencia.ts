
import type { ContaPagarReceber } from '@/types/contas'
import { useContasCrud } from './useContasCrud'

export function useContasRecorrencia() {
  const { updateConta, createConta } = useContasCrud()

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

  return {
    pararRecorrencia,
    gerarRecorrencia
  }
}
