
import { CachedSubscriptionData, SubscriptionData } from './types'

// Cache duration: 24 horas (em milissegundos)
const CACHE_DURATION = 24 * 60 * 60 * 1000

const getCacheKey = (userId: string) => `subscription_cache_${userId}`

export const getCachedSubscription = (userId: string): CachedSubscriptionData | null => {
  try {
    const cached = localStorage.getItem(getCacheKey(userId))
    if (!cached) return null
    
    const parsed = JSON.parse(cached) as CachedSubscriptionData
    const now = Date.now()
    
    // Verifica se o cache ainda é válido (menos de 24 horas)
    if (now - parsed.cachedAt < CACHE_DURATION) {
      console.log('Using cached subscription data, valid for:', Math.round((CACHE_DURATION - (now - parsed.cachedAt)) / (1000 * 60 * 60)), 'more hours')
      return parsed
    }
    
    // Cache expirado, remove
    localStorage.removeItem(getCacheKey(userId))
    return null
  } catch (error) {
    console.error('Error reading subscription cache:', error)
    return null
  }
}

export const setCachedSubscription = (userId: string, data: SubscriptionData) => {
  try {
    const cachedData: CachedSubscriptionData = {
      ...data,
      cachedAt: Date.now()
    }
    localStorage.setItem(getCacheKey(userId), JSON.stringify(cachedData))
    console.log('Subscription data cached for 24 hours')
  } catch (error) {
    console.error('Error caching subscription data:', error)
  }
}

export const clearSubscriptionCache = (userId?: string) => {
  try {
    if (userId) {
      localStorage.removeItem(getCacheKey(userId))
    }
    console.log('Subscription cache cleared')
  } catch (error) {
    console.error('Error clearing subscription cache:', error)
  }
}
