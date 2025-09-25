
import type { CachedSubscriptionData, SubscriptionData } from './types'

const CACHE_KEY_PREFIX = 'subscription_'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const DAILY_CHECK_KEY = 'subscription_daily_check_'

export function getCachedSubscription(userId: string): SubscriptionData | null {
  try {
    const cacheKey = `${CACHE_KEY_PREFIX}${userId}`
    const cached = localStorage.getItem(cacheKey)
    
    if (!cached) return null
    
    const parsedCache: CachedSubscriptionData = JSON.parse(cached)
    const now = Date.now()
    
    // Check if cache has expired
    if (now - parsedCache.cachedAt > CACHE_DURATION) {
      localStorage.removeItem(cacheKey)
      return null
    }
    
    console.log('Loading subscription from cache', { userId, age: now - parsedCache.cachedAt })
    
    // Return without the cachedAt timestamp
    const { cachedAt, ...subscriptionData } = parsedCache
    return subscriptionData
  } catch (error) {
    console.error('Error reading subscription cache:', error)
    return null
  }
}

export function setCachedSubscription(userId: string, data: SubscriptionData): void {
  try {
    const cacheKey = `${CACHE_KEY_PREFIX}${userId}`
    const cachedData: CachedSubscriptionData = {
      ...data,
      cachedAt: Date.now()
    }
    
    localStorage.setItem(cacheKey, JSON.stringify(cachedData))
    
    // Mark that we've checked today if subscription is active
    if (data.subscribed) {
      const dailyKey = `${DAILY_CHECK_KEY}${userId}`
      const today = new Date().toDateString()
      localStorage.setItem(dailyKey, today)
    }
    
    console.log('Subscription cached', { userId, subscribed: data.subscribed, tier: data.subscription_tier })
  } catch (error) {
    console.error('Error caching subscription:', error)
  }
}

export function clearSubscriptionCache(userId?: string): void {
  try {
    if (userId) {
      // Clear specific user cache
      const cacheKey = `${CACHE_KEY_PREFIX}${userId}`
      const dailyKey = `${DAILY_CHECK_KEY}${userId}`
      localStorage.removeItem(cacheKey)
      localStorage.removeItem(dailyKey)
      console.log('Cleared subscription cache for user', { userId })
    } else {
      // Clear all subscription caches
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(CACHE_KEY_PREFIX) || key.startsWith(DAILY_CHECK_KEY)) {
          localStorage.removeItem(key)
        }
      })
      console.log('Cleared all subscription caches')
    }
  } catch (error) {
    console.error('Error clearing subscription cache:', error)
  }
}

export function wasCheckedToday(userId: string): boolean {
  try {
    const dailyKey = `${DAILY_CHECK_KEY}${userId}`
    const lastCheck = localStorage.getItem(dailyKey)
    const today = new Date().toDateString()
    
    return lastCheck === today
  } catch (error) {
    console.error('Error checking daily verification:', error)
    return false
  }
}

export function shouldShowSplash(userId: string): boolean {
  // Show splash if we don't have cached data or haven't checked today
  const hasCached = getCachedSubscription(userId) !== null
  const checkedToday = wasCheckedToday(userId)
  
  return !hasCached || !checkedToday
}

export function forceRefreshCache(userId: string): void {
  clearSubscriptionCache(userId)
  console.log('Forced cache refresh for user', { userId })
}
