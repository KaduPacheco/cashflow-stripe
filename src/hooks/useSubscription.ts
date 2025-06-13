
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

export interface SubscriptionData {
  subscribed: boolean
  subscription_tier?: string
  subscription_end?: string
  subscription_id?: string
}

export function useSubscription() {
  const { user } = useAuth()
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    subscribed: false
  })
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)

  const checkSubscription = async () => {
    if (!user) {
      setSubscriptionData({ subscribed: false })
      setLoading(false)
      return
    }

    try {
      setChecking(true)
      console.log('Checking subscription for user:', user.id)
      
      const { data, error } = await supabase.functions.invoke('check-subscription')
      
      if (error) {
        console.error('Error checking subscription:', error)
        throw error
      }

      console.log('Subscription check result:', data)
      setSubscriptionData(data)
    } catch (error: any) {
      console.error('Failed to check subscription:', error)
      toast({
        title: "Erro ao verificar assinatura",
        description: error.message,
        variant: "destructive",
      })
      setSubscriptionData({ subscribed: false })
    } finally {
      setLoading(false)
      setChecking(false)
    }
  }

  const createCheckout = async () => {
    try {
      console.log('Creating checkout session...')
      const { data, error } = await supabase.functions.invoke('create-checkout')
      
      if (error) {
        console.error('Error creating checkout:', error)
        throw error
      }

      if (data?.url) {
        console.log('Redirecting to checkout:', data.url)
        window.open(data.url, '_blank')
      }
    } catch (error: any) {
      console.error('Failed to create checkout:', error)
      toast({
        title: "Erro ao criar sessão de pagamento",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const openCustomerPortal = async () => {
    try {
      console.log('Opening customer portal...')
      const { data, error } = await supabase.functions.invoke('customer-portal')
      
      if (error) {
        console.error('Error opening customer portal:', error)
        throw error
      }

      if (data?.url) {
        console.log('Redirecting to customer portal:', data.url)
        window.open(data.url, '_blank')
      }
    } catch (error: any) {
      console.error('Failed to open customer portal:', error)
      toast({
        title: "Erro ao abrir portal do cliente",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    checkSubscription()
  }, [user])

  // Auto-refresh subscription status every 30 seconds when user is active
  useEffect(() => {
    if (!user || !subscriptionData.subscribed) return

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        checkSubscription()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [user, subscriptionData.subscribed])

  return {
    subscriptionData,
    loading,
    checking,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
  }
}
