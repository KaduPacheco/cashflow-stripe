
/**
 * Utilitário para formatação de datas no padrão brasileiro
 * Converte timestamps UTC para horário de Brasília e formata como dd/mm/aaaa HH:MM:SS
 */

export function formatBrazilianDateTime(dateString: string | null | undefined): string {
  if (!dateString) return '-'
  
  try {
    const date = new Date(dateString)
    
    // Converte para horário de Brasília (UTC-3)
    const brazilDate = new Date(date.getTime() - (3 * 60 * 60 * 1000))
    
    const day = brazilDate.getUTCDate().toString().padStart(2, '0')
    const month = (brazilDate.getUTCMonth() + 1).toString().padStart(2, '0')
    const year = brazilDate.getUTCFullYear()
    const hours = brazilDate.getUTCHours().toString().padStart(2, '0')
    const minutes = brazilDate.getUTCMinutes().toString().padStart(2, '0')
    const seconds = brazilDate.getUTCSeconds().toString().padStart(2, '0')
    
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
  } catch (error) {
    console.error('Erro ao formatar data:', error)
    return '-'
  }
}

export function formatBrazilianDate(dateString: string | null | undefined): string {
  if (!dateString) return '-'
  
  try {
    const date = new Date(dateString)
    const brazilDate = new Date(date.getTime() - (3 * 60 * 60 * 1000))
    
    const day = brazilDate.getUTCDate().toString().padStart(2, '0')
    const month = (brazilDate.getUTCMonth() + 1).toString().padStart(2, '0')
    const year = brazilDate.getUTCFullYear()
    
    return `${day}/${month}/${year}`
  } catch (error) {
    console.error('Erro ao formatar data:', error)
    return '-'
  }
}

export function getCurrentBrazilianDateTime(): string {
  const now = new Date()
  return formatBrazilianDateTime(now.toISOString())
}
