
import { CachedSubscriptionData, SubscriptionData } from './types'
import { SecureCacheManager } from './secureCache'
import { SecureLogger } from '@/lib/logger'

// Função utilitária para verificar se uma data é hoje
function isToday(dateString: string): boolean {
  const date = new Date(dateString)
  const today = new Date()
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear()
}

// Função para verificar se a verificação já foi feita hoje
export const wasCheckedToday = (userId: string): boolean => {
  try {
    const lastCheck = localStorage.getItem(`last_subscription_check_${userId}`)
    if (!lastCheck) return false
    
    return isToday(lastCheck)
  } catch (error) {
    SecureLogger.error('Error checking last subscription check', error)
    return false
  }
}

export const getCachedSubscription = (userId: string): CachedSubscriptionData | null => {
  return SecureCacheManager.getCachedSubscription(userId)
}

export const setCachedSubscription = (userId: string, data: SubscriptionData) => {
  SecureCacheManager.setCachedSubscription(userId, data)
  
  // Salva também o timestamp da última verificação
  try {
    localStorage.setItem(`last_subscription_check_${userId}`, new Date().toISOString())
    SecureLogger.debug('Last subscription check timestamp updated')
  } catch (error) {
    SecureLogger.error('Error updating last subscription check', error)
  }
}

export const clearSubscriptionCache = (userId?: string) => {
  if (userId) {
    SecureCacheManager.clearCache(userId)
    try {
      localStorage.removeItem(`last_subscription_check_${userId}`)
    } catch (error) {
      SecureLogger.error('Error clearing subscription cache', error)
    }
  }
  SecureLogger.debug('Subscription cache cleared')
}

export const shouldShowSplash = (userId: string): boolean => {
  // Mostra splash apenas se não foi verificado hoje ou não há cache válido
  return !wasCheckedToday(userId) || !getCachedSubscription(userId)
}

// Nova função para validar integridade do cache
export const validateCacheIntegrity = (userId: string): boolean => {
  return SecureCacheManager.validateCacheIntegrity(userId)
}
