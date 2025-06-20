
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

export interface SubscriptionData {
  subscribed: boolean
  subscription_tier?: string
  subscription_end?: string
  subscription_id?: string
  error?: string
}

export function useSubscription() {
  const { user, session } = useAuth()
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    subscribed: false
  })
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)

  const checkSubscription = async () => {
    if (!user || !session?.access_token) {
      console.log('No user or session token available')
      setSubscriptionData({ subscribed: false })
      setLoading(false)
      return
    }

    try {
      setChecking(true)
      console.log('Checking subscription for user:', user.id)
      console.log('Using session token:', session.access_token.substring(0, 20) + '...')
      
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })
      
      if (error) {
        console.error('Error checking subscription:', error)
        // Em caso de erro, assumir não subscrito
        setSubscriptionData({ subscribed: false, error: error.message })
        return
      }

      console.log('Subscription check result:', data)
      
      // Se a resposta contém erro, mas status 200, tratar como não subscrito
      if (data?.error) {
        console.log('Subscription check returned error:', data.error)
        setSubscriptionData({ subscribed: false, error: data.error })
        return
      }
      
      setSubscriptionData(data || { subscribed: false })
    } catch (error: any) {
      console.error('Failed to check subscription:', error)
      // Não mostrar toast de erro se for problema de autenticação
      if (!error.message?.includes('User not authenticated')) {
        toast({
          title: "Erro ao verificar assinatura",
          description: error.message || "Erro desconhecido ao verificar assinatura",
          variant: "destructive",
        })
      }
      setSubscriptionData({ subscribed: false, error: error.message })
    } finally {
      setLoading(false)
      setChecking(false)
    }
  }

  const createCheckout = async () => {
    if (!user || !session?.access_token) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para criar uma assinatura",
        variant: "destructive",
      })
      return
    }

    try {
      console.log('Creating checkout session for user:', user.id)
      console.log('Using session token:', session.access_token.substring(0, 20) + '...')
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })
      
      if (error) {
        console.error('Error creating checkout:', error)
        throw error
      }

      if (data?.url) {
        console.log('Redirecting to checkout:', data.url)
        window.open(data.url, '_blank')
        
        toast({
          title: "Redirecionando para pagamento",
          description: "Abrindo nova aba com o checkout do Stripe...",
        })
      } else {
        throw new Error('URL do checkout não retornada')
      }
    } catch (error: any) {
      console.error('Failed to create checkout:', error)
      toast({
        title: "Erro ao criar sessão de pagamento",
        description: error.message || "Erro desconhecido ao criar checkout",
        variant: "destructive",
      })
    }
  }

  const openCustomerPortal = async () => {
    if (!user || !session?.access_token) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para acessar o portal do cliente",
        variant: "destructive",
      })
      return
    }

    try {
      console.log('Opening customer portal for user:', user.id)
      
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })
      
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
        description: error.message || "Erro desconhecido ao abrir portal",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    if (session && user) {
      checkSubscription()
    } else {
      setLoading(false)
      setSubscriptionData({ subscribed: false })
    }
  }, [user, session])

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
