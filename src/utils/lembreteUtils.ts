
import { formatBrazilianDate } from './dateFormatter'

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR')
}

export const isOverdue = (dateString: string) => {
  return new Date(dateString) < new Date()
}

export const isToday = (dateString: string) => {
  const today = new Date()
  const date = new Date(dateString)
  return date.toDateString() === today.toDateString()
}

export const getDateStatus = (dateString: string) => {
  if (isOverdue(dateString)) {
    return { variant: 'destructive' as const, label: 'Vencido' }
  }
  if (isToday(dateString)) {
    return { variant: 'default' as const, label: 'Hoje' }
  }
  const daysDiff = Math.ceil((new Date(dateString).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  if (daysDiff <= 7) {
    return { variant: 'secondary' as const, label: `${daysDiff} dias` }
  }
  return { variant: 'outline' as const, label: formatDate(dateString) }
}
