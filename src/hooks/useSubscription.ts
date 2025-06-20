
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

export interface SubscriptionData {
  subscribed: boolean
  subscription_tier?: string
  subscription_end?: string
  subscription_id?: string
  error?: string
  errorType?: 'session' | 'subscription' | 'network' | 'unknown'
}

export function useSubscription() {
  const { user, session } = useAuth()
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    subscribed: false
  })
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [retryAttempts, setRetryAttempts] = useState(0)

  const checkSubscription = async (isRetry = false) => {
    if (!user || !session?.access_token) {
      console.log('No user or session token available')
      setSubscriptionData({ 
        subscribed: false,
        error: 'Sessão não encontrada',
        errorType: 'session'
      })
      setLoading(false)
      return
    }

    try {
      setChecking(true)
      console.log('Checking subscription for user:', user.id)
      
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })
      
      if (error) {
        console.error('Error checking subscription:', error)
        
        // Detectar erro de sessão expirada
        const isSessionError = error.message?.includes('session') || 
                              error.message?.includes('token') ||
                              error.message?.includes('unauthorized') ||
                              error.message?.includes('User not authenticated')
        
        if (isSessionError && !isRetry && retryAttempts < 2) {
          console.log('Session error detected, attempting to refresh...')
          setRetryAttempts(prev => prev + 1)
          
          // Tentar refresh da sessão
          const { data: sessionData, error: refreshError } = await supabase.auth.refreshSession()
          
          if (!refreshError && sessionData.session) {
            console.log('Session refreshed successfully, retrying subscription check...')
            // Aguardar um pouco para a sessão ser atualizada
            setTimeout(() => checkSubscription(true), 1000)
            return
          }
        }
        
        setSubscriptionData({ 
          subscribed: false, 
          error: isSessionError ? 'Sessão expirada. Faça login novamente.' : error.message,
          errorType: isSessionError ? 'session' : 'subscription'
        })
        return
      }

      console.log('Subscription check result:', data)
      
      // Se a resposta contém erro, mas status 200, tratar como não subscrito
      if (data?.error) {
        console.log('Subscription check returned error:', data.error)
        
        const isSessionError = data.error.includes('session') || 
                              data.error.includes('token') ||
                              data.error.includes('User not authenticated')
        
        setSubscriptionData({ 
          subscribed: false,
          error: isSessionError ? 'Sessão expirada. Faça login novamente.' : data.error,
          errorType: isSessionError ? 'session' : 'subscription'
        })
        return
      }
      
      // Reset retry attempts em caso de sucesso
      setRetryAttempts(0)
      setSubscriptionData(data || { subscribed: false })
      
    } catch (error: any) {
      console.error('Failed to check subscription:', error)
      
      const isNetworkError = error.name === 'NetworkError' || 
                            error.message?.includes('fetch') ||
                            error.message?.includes('network')
      
      const isSessionError = error.message?.includes('User not authenticated') ||
                            error.message?.includes('session') ||
                            error.message?.includes('token')
      
      let errorMessage = 'Erro ao verificar assinatura'
      let errorType: SubscriptionData['errorType'] = 'unknown'
      
      if (isSessionError) {
        errorMessage = 'Sessão expirada. Faça login novamente.'
        errorType = 'session'
      } else if (isNetworkError) {
        errorMessage = 'Erro de conexão. Verifique sua internet.'
        errorType = 'network'
      }
      
      // Não mostrar toast de erro para problemas de sessão
      if (!isSessionError) {
        toast.error("Erro ao verificar assinatura", {
          description: errorMessage,
        })
      }
      
      setSubscriptionData({ subscribed: false, error: errorMessage, errorType })
    } finally {
      setLoading(false)
      setChecking(false)
    }
  }

  const forceRefresh = async () => {
    console.log('Force refreshing subscription...')
    setRetryAttempts(0)
    setLoading(true)
    await checkSubscription(false)
  }

  const createCheckout = async () => {
    if (!user || !session?.access_token) {
      toast.error("Erro de autenticação", {
        description: "Você precisa estar logado para criar uma assinatura",
      })
      return
    }

    try {
      console.log('Creating checkout session for user:', user.id)
      
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
        
        toast.success("Redirecionando para pagamento", {
          description: "Abrindo nova aba com o checkout do Stripe...",
        })
      } else {
        throw new Error('URL do checkout não retornada')
      }
    } catch (error: any) {
      console.error('Failed to create checkout:', error)
      toast.error("Erro ao criar sessão de pagamento", {
        description: error.message || "Erro desconhecido ao criar checkout",
      })
    }
  }

  const openCustomerPortal = async () => {
    if (!user || !session?.access_token) {
      toast.error("Erro de autenticação", {
        description: "Você precisa estar logado para acessar o portal do cliente",
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
      toast.error("Erro ao abrir portal do cliente", {
        description: error.message || "Erro desconhecido ao abrir portal",
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
    checkSubscription: forceRefresh,
    createCheckout,
    openCustomerPortal,
  }
}
