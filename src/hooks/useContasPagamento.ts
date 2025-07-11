
import { useState } from 'react'
import { useContasCrud } from './useContasCrud'
import { useContasTransacoesSinc } from './useContasTransacoesSinc'
import type { ContaPagarReceber } from '@/types/contas'
import { toast } from 'sonner'

export function useContasPagamento() {
  const { updateConta } = useContasCrud()
  const { criarTransacaoFromConta } = useContasTransacoesSinc()
  const [contas, setContas] = useState<ContaPagarReceber[]>([])

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
      const contaCompleta = contaAtualizada ? Object.assign({}, conta, contaAtualizada) : conta

      const transacaoCriada = await criarTransacaoFromConta(contaCompleta, valorPago, dataPagamento)

      if (!transacaoCriada) {
        console.warn('Transação não foi criada, mas pagamento foi registrado')
        toast.info('Pagamento registrado, mas transação não foi criada automaticamente')
      }

      return contaAtualizada
    } catch (error) {
      console.error('Erro no processo de pagamento:', error)
      toast.error('Erro ao processar pagamento')
      return null
    }
  }

  return {
    pagarConta,
    setContas
  }
}
