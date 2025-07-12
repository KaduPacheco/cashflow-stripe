
import { Lembrete } from '@/types/lembrete'

export const createWhatsAppMessage = (lembrete: Lembrete, userName?: string) => {
  const nomeCliente = userName || 'Cliente'
  const titulo = lembrete.descricao || 'Lembrete'
  const valor = lembrete.valor ? new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(lembrete.valor) : ''
  const data = lembrete.data ? new Date(lembrete.data).toLocaleDateString('pt-BR') : ''
  
  let mensagem = `Olá ${nomeCliente}, este é um lembrete: ${titulo}`
  
  if (data) {
    mensagem += ` agendado para ${data}`
  }
  
  if (valor) {
    mensagem += ` no valor de ${valor}`
  }
  
  mensagem += '.'
  
  return encodeURIComponent(mensagem)
}

export const openWhatsApp = (phoneNumber: string, message: string) => {
  // Remove caracteres não numéricos do número de telefone
  const cleanPhone = phoneNumber.replace(/[^\d]/g, '')
  
  // Adiciona código do país se não estiver presente
  const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`
  
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${message}`
  window.open(whatsappUrl, '_blank')
}
