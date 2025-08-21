
import { supabase } from '@/lib/supabase'
import { BUSINESS_RULES, ERROR_MESSAGES } from '@/config/constants'

export interface SubscriptionData {
  subscribed: boolean
  subscription_tier: typeof BUSINESS_RULES.SUBSCRIPTION_TIERS[number]
  subscription_end: string | null
  subscription_id: string | null
}

export class SubscriptionService {
  static async checkSubscription(userId: string): Promise<SubscriptionData | null> {
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        body: { userId }
      })

      if (error) {
        console.error('Subscription check error:', error)
        return null
      }

      return data as SubscriptionData
    } catch (error) {
      console.error('Subscription service error:', error)
      return null
    }
  }

  static async createCheckoutSession(userId: string, priceId: string) {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { userId, priceId }
      })

      if (error) {
        throw new Error(ERROR_MESSAGES.GENERIC_ERROR)
      }

      return data
    } catch (error) {
      console.error('Checkout creation error:', error)
      throw error
    }
  }

  static async getCustomerPortal(userId: string) {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        body: { userId }
      })

      if (error) {
        throw new Error(ERROR_MESSAGES.GENERIC_ERROR)
      }

      return data
    } catch (error) {
      console.error('Customer portal error:', error)
      throw error
    }
  }

  static isPremiumFeature(feature: string, subscriptionTier: string): boolean {
    const premiumFeatures = [
      'advanced-reports',
      'export-pdf',
      'unlimited-transactions',
      'recurring-accounts'
    ]

    // Return true if feature requires premium and user doesn't have premium access
    return premiumFeatures.includes(feature) && !this.hasPremiumAccess(subscriptionTier)
  }

  // Helper method to display tier name to user (VIP shows as Premium)
  static getDisplayTier(subscriptionTier: string): string {
    return subscriptionTier === 'VIP' ? 'Premium' : subscriptionTier
  }

  // Helper method to check if user has premium access (includes VIP)
  static hasPremiumAccess(subscriptionTier: string): boolean {
    return ['Premium', 'VIP'].includes(subscriptionTier)
  }

  // New method to force refresh subscription status
  static async forceRefreshSubscription(session: any): Promise<SubscriptionData | null> {
    if (!session?.access_token) return null

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (error) {
        console.error('Force refresh error:', error)
        return null
      }

      return data as SubscriptionData
    } catch (error) {
      console.error('Force refresh subscription error:', error)
      return null
    }
  }
}
