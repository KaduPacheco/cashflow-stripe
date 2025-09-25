
export interface SubscriptionData {
  subscribed: boolean
  subscription_tier?: 'Free' | 'Premium' | 'VIP'
  subscription_end?: string
  subscription_id?: string
  status?: string
  message?: string
  error?: string
  errorType?: 'session' | 'subscription' | 'network' | 'rate_limit' | 'configuration' | 'service' | 'unknown'
  fromCache?: boolean
}

export interface CachedSubscriptionData extends SubscriptionData {
  cachedAt: number
}
