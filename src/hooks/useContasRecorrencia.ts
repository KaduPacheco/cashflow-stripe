
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

    // Create a clean copy without relational fields
    const novaConta = {
      user_id: contaOriginal.user_id,
      tipo: contaOriginal.tipo,
      descricao: contaOriginal.descricao,
      valor: contaOriginal.valor,
      data_vencimento: contaOriginal.data_proxima_recorrencia,
      valor_pago: 0,
      status: 'pendente' as const,
      category_id: contaOriginal.category_id,
      cliente_fornecedor_id: contaOriginal.cliente_fornecedor_id,
      observacoes: contaOriginal.observacoes,
      numero_documento: contaOriginal.numero_documento,
      recorrencia: contaOriginal.recorrencia,
      conta_origem_id: contaOriginal.id,
      data_proxima_recorrencia: proximaData.toISOString().split('T')[0]
    }

    return createConta(novaConta)
  }

  return {
    pararRecorrencia,
    gerarRecorrencia
  }
}
