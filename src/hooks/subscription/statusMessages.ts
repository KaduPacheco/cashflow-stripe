
export const getStatusMessage = (status: string, subscribed: boolean): string => {
  if (subscribed) {
    switch (status) {
      case 'active': return 'Assinatura ativa'
      case 'trialing': return 'Período de teste ativo'
      case 'past_due': return 'Pagamento em atraso'
      default: return 'Assinatura ativa'
    }
  } else {
    switch (status) {
      case 'canceled': return 'Assinatura cancelada'
      case 'expired': return 'Assinatura expirada'
      case 'no_customer': return 'Nenhuma assinatura encontrada'
      case 'no_subscription': return 'Nenhuma assinatura ativa'
      default: return 'Assinatura inativa'
    }
  }
}
