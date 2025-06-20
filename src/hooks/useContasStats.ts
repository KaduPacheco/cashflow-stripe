
import type { ContaPagarReceber, ContasStats } from '@/types/contas'

export function calculateContasStats(contasData: ContaPagarReceber[]): ContasStats {
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

  return {
    totalAPagar,
    totalAReceber,
    totalVencidas,
    totalPagasNoMes,
    saldoProjetado
  }
}
