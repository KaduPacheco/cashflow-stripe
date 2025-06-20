
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
  errorType?: 'session' | 'subscription' | 'network' | 'rate_limit' | 'unknown'
}

export function useSubscription() {
  const { user, session, signOut } = useAuth()
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    subscribed: false
  })
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [retryAttempts, setRetryAttempts] = useState(0)
  const [backoffDelay, setBackoffDelay] = useState(1000)

  const checkSubscription = async (isRetry = false) => {
    console.log('Checking subscription...', { user: !!user, session: !!session })
    
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

    // Verificar se o token está próximo do vencimento (dentro de 5 minutos)
    if (session.expires_at) {
      const expiresAt = session.expires_at * 1000
      const now = Date.now()
      const fiveMinutes = 5 * 60 * 1000
      
      if (expiresAt - now < fiveMinutes) {
        console.log('Token close to expiration, refreshing session...')
        try {
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
          if (refreshError) {
            console.error('Failed to refresh session:', refreshError)
            // Se falhar ao renovar, fazer logout para limpar sessão inválida
            await signOut()
            return
          }
          if (!refreshData.session) {
            console.log('No session after refresh')
            await signOut()
            return
          }
        } catch (error) {
          console.error('Session refresh error:', error)
          await signOut()
          return
        }
      }
    }

    try {
      setChecking(true)
      console.log('Making subscription check request...')
      
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })
      
      if (error) {
        console.error('Error checking subscription:', error)
        
        const errorMessage = error.message || String(error)
        
        // Detectar rate limiting
        if (errorMessage.includes('Request rate limit exceeded') || 
            errorMessage.includes('rate limit') ||
            errorMessage.includes('Too Many Requests')) {
          console.log('Rate limit detected')
          setSubscriptionData({ 
            subscribed: false, 
            error: 'Muitas tentativas. Aguarde um momento e tente novamente.',
            errorType: 'rate_limit'
          })
          const newDelay = Math.min(backoffDelay * 2, 30000)
          setBackoffDelay(newDelay)
          setRetryAttempts(prev => prev + 1)
          setLoading(false)
          setChecking(false)
          return
        }
        
        // Detectar erros de sessão
        const isSessionError = errorMessage.includes('session') || 
                              errorMessage.includes('token') ||
                              errorMessage.includes('unauthorized') ||
                              errorMessage.includes('User not authenticated') ||
                              errorMessage.includes('Authentication error')
        
        // Detectar erros de rede
        const isNetworkError = errorMessage.includes('NetworkError') || 
                              errorMessage.includes('fetch') ||
                              errorMessage.includes('network') ||
                              errorMessage.includes('connection') ||
                              error.name === 'NetworkError'
        
        if (isSessionError && !isRetry && retryAttempts < 2) {
          console.log('Session error detected, attempting session refresh...')
          setRetryAttempts(prev => prev + 1)
          
          try {
            const { data: sessionData, error: refreshError } = await supabase.auth.refreshSession()
            
            if (!refreshError && sessionData.session) {
              console.log('Session refreshed successfully, retrying...')
              setTimeout(() => checkSubscription(true), 1000)
              return
            } else {
              console.log('Session refresh failed, signing out...')
              await signOut()
              return
            }
          } catch (refreshErr) {
            console.error('Session refresh failed:', refreshErr)
            await signOut()
            return
          }
        }
        
        let errorType: SubscriptionData['errorType'] = 'unknown'
        let displayError = 'Erro ao verificar assinatura'
        
        if (isSessionError) {
          errorType = 'session'
          displayError = 'Sessão expirada. Faça login novamente.'
        } else if (isNetworkError) {
          errorType = 'network'
          displayError = 'Erro de conexão. Verifique sua internet.'
        } else {
          errorType = 'subscription'
          displayError = errorMessage
        }
        
        setSubscriptionData({ 
          subscribed: false, 
          error: displayError,
          errorType
        })
        return
      }

      console.log('Subscription check result:', data)
      
      if (data?.error) {
        console.log('Subscription check returned error:', data.error)
        
        const isSessionError = data.error.includes('session') || 
                              data.error.includes('token') ||
                              data.error.includes('User not authenticated')
        
        const isRateLimit = data.error.includes('Request rate limit exceeded')
        
        let errorType: SubscriptionData['errorType'] = 'subscription'
        let displayError = data.error
        
        if (isSessionError) {
          errorType = 'session'
          displayError = 'Sessão expirada. Faça login novamente.'
          // Se erro de sessão, fazer logout para limpar estado
          await signOut()
          return
        } else if (isRateLimit) {
          errorType = 'rate_limit'
          displayError = 'Muitas tentativas. Aguarde um momento.'
        }
        
        setSubscriptionData({ 
          subscribed: false,
          error: displayError,
          errorType
        })
        return
      }
      
      // Reset retry attempts and backoff on success
      setRetryAttempts(0)
      setBackoffDelay(1000)
      setSubscriptionData(data || { subscribed: false })
      
    } catch (error: any) {
      console.error('Failed to check subscription:', error)
      
      const errorMessage = error.message || String(error)
      
      const isNetworkError = error.name === 'NetworkError' || 
                            errorMessage.includes('fetch') ||
                            errorMessage.includes('network') ||
                            errorMessage.includes('connection')
      
      const isSessionError = errorMessage.includes('User not authenticated') ||
                            errorMessage.includes('session') ||
                            errorMessage.includes('token')
      
      let errorType: SubscriptionData['errorType'] = 'unknown'
      let displayError = 'Erro ao verificar assinatura'
      
      if (isSessionError) {
        errorType = 'session'
        displayError = 'Sessão expirada. Faça login novamente.'
        await signOut()
        return
      } else if (isNetworkError) {
        errorType = 'network'
        displayError = 'Erro de conexão. Verifique sua internet.'
      }
      
      if (!isSessionError) {
        toast.error("Erro ao verificar assinatura", {
          description: displayError,
        })
      }
      
      setSubscriptionData({ subscribed: false, error: displayError, errorType })
    } finally {
      setLoading(false)
      setChecking(false)
    }
  }

  const forceRefresh = async () => {
    console.log('Force refreshing subscription...')
    setRetryAttempts(0)
    setBackoffDelay(1000)
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

  // Auto-refresh subscription status every 5 minutes when user is active and subscribed
  useEffect(() => {
    if (!user || !subscriptionData.subscribed) return

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        checkSubscription()
      }
    }, 300000) // 5 minutes

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
