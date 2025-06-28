import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

export interface SubscriptionData {
  subscribed: boolean
  subscription_tier?: string
  subscription_end?: string
  subscription_id?: string
  status?: string
  message?: string
  error?: string
  errorType?: 'session' | 'subscription' | 'network' | 'rate_limit' | 'configuration' | 'service' | 'unknown'
}

export function useSubscription() {
  const { user, session, signOut } = useAuth()
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    subscribed: false
  })
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [retryAttempts, setRetryAttempts] = useState(0)
  const [lastCheckTime, setLastCheckTime] = useState<number>(0)
  const [isRateLimited, setIsRateLimited] = useState(false)
  
  // Refs para controlar timeouts e evitar memory leaks
  const timeoutRef = useRef<NodeJS.Timeout>()
  const rateLimitTimeoutRef = useRef<NodeJS.Timeout>()
  const checkTimeoutRef = useRef<NodeJS.Timeout>()

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (rateLimitTimeoutRef.current) clearTimeout(rateLimitTimeoutRef.current)
      if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current)
    }
  }, [])

  // Função para mapear status para mensagens amigáveis
  const getStatusMessage = (status: string, subscribed: boolean): string => {
    if (subscribed) {
      switch (status) {
        case 'active': return 'Assinatura ativa'
        case 'trialing': return 'Período de teste ativo'
        case 'past_due': return 'Pagamento em atraso'
        default: return 'Assinatura ativa'
      }
    } else {
      switch (status) {
        case 'canceled': return 'Assinatura cancelada'
        case 'expired': return 'Assinatura expirada'
        case 'no_customer': return 'Nenhuma assinatura encontrada'
        case 'no_subscription': return 'Nenhuma assinatura ativa'
        default: return 'Assinatura inativa'
      }
    }
  }

  const checkSubscription = async (isRetry = false, skipRateCheck = false, showToast = false) => {
    console.log('Checking subscription...', { user: !!user, session: !!session, isRetry, isRateLimited })
    
    // Se estamos em rate limit e não é um skip, bloquear
    if (isRateLimited && !skipRateCheck) {
      console.log('Rate limited, skipping check')
      return
    }

    // Evitar múltiplas chamadas simultâneas
    if (checking && !skipRateCheck) {
      console.log('Already checking, skipping')
      return
    }

    // Controle de frequência - mínimo 2 segundos entre checks
    const now = Date.now()
    const timeSinceLastCheck = now - lastCheckTime
    if (timeSinceLastCheck < 2000 && !skipRateCheck && !isRetry) {
      console.log('Too frequent, skipping check')
      return
    }

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
      const fiveMinutes = 5 * 60 * 1000
      
      if (expiresAt - now < fiveMinutes) {
        console.log('Token close to expiration, refreshing session...')
        try {
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
          if (refreshError) {
            console.error('Failed to refresh session:', refreshError)
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
      setLastCheckTime(now)
      console.log('Making subscription check request...')
      
      // Timeout para a verificação (10 segundos)
      const checkPromise = supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })
      
      const timeoutPromise = new Promise((_, reject) => {
        checkTimeoutRef.current = setTimeout(() => {
          reject(new Error('Verificação de assinatura expirou. Tente novamente.'))
        }, 10000) // 10 segundos timeout
      })
      
      const { data, error } = await Promise.race([checkPromise, timeoutPromise]) as any
      
      // Limpar timeout se completou
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current)
        checkTimeoutRef.current = undefined
      }
      
      if (error) {
        console.error('Error checking subscription:', error)
        
        const errorMessage = error.message || String(error)
        
        // Detectar timeout
        if (errorMessage.includes('expirou') || errorMessage.includes('timeout')) {
          setSubscriptionData({ 
            subscribed: false, 
            error: 'Verificação demorou muito. Tente novamente em alguns segundos.',
            errorType: 'service'
          })
          setLoading(false)
          setChecking(false)
          return
        }
        
        // Detectar rate limiting
        if (errorMessage.includes('Request rate limit exceeded') || 
            errorMessage.includes('rate limit') ||
            errorMessage.includes('Too Many Requests')) {
          console.log('Rate limit detected, implementing backoff')
          
          setIsRateLimited(true)
          setSubscriptionData({ 
            subscribed: false, 
            error: 'Muitas tentativas. Aguardando automaticamente...',
            errorType: 'rate_limit'
          })
          
          // Backoff de 30 segundos
          rateLimitTimeoutRef.current = setTimeout(() => {
            console.log('Rate limit period expired, re-enabling checks')
            setIsRateLimited(false)
            setRetryAttempts(0)
          }, 30000)
          
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
              // Delay antes de retry para evitar rate limit
              timeoutRef.current = setTimeout(() => {
                checkSubscription(true, true, showToast)
              }, 1500)
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
        const isConfiguration = data.errorType === 'configuration'
        
        if (isRateLimit) {
          setIsRateLimited(true)
          setSubscriptionData({ 
            subscribed: false,
            error: 'Muitas tentativas. Aguardando automaticamente.',
            errorType: 'rate_limit'
          })
          
          rateLimitTimeoutRef.current = setTimeout(() => {
            setIsRateLimited(false)
            setRetryAttempts(0)
          }, 30000)
          
          return
        }
        
        if (isConfiguration) {
          setSubscriptionData({ 
            subscribed: false,
            error: 'Serviço temporariamente indisponível. Tente novamente em alguns minutos.',
            errorType: 'configuration'
          })
          return
        }
        
        let errorType: SubscriptionData['errorType'] = 'subscription'
        let displayError = data.error
        
        if (isSessionError) {
          errorType = 'session'
          displayError = 'Sessão expirada. Faça login novamente.'
          await signOut()
          return
        }
        
        setSubscriptionData({ 
          subscribed: false,
          error: displayError,
          errorType
        })
        return
      }
      
      // Reset retry attempts and rate limit on success
      setRetryAttempts(0)
      setIsRateLimited(false)
      if (rateLimitTimeoutRef.current) {
        clearTimeout(rateLimitTimeoutRef.current)
      }
      
      const newSubscriptionData = data || { subscribed: false }
      
      // Adicionar mensagem amigável baseada no status
      if (newSubscriptionData.status) {
        newSubscriptionData.message = getStatusMessage(newSubscriptionData.status, newSubscriptionData.subscribed)
      }
      
      setSubscriptionData(newSubscriptionData)
      
      // Show success toast if requested and subscription is active
      if (showToast && newSubscriptionData.subscribed) {
        toast.success("Assinatura verificada com sucesso!", {
          description: newSubscriptionData.message || `Plano ${newSubscriptionData.subscription_tier} ativo`,
        })
      } else if (showToast && !newSubscriptionData.subscribed) {
        toast.info("Status da assinatura", {
          description: newSubscriptionData.message || "Nenhuma assinatura ativa encontrada",
        })
      }
      
    } catch (error: any) {
      console.error('Failed to check subscription:', error)
      
      // Limpar timeout em caso de erro
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current)
        checkTimeoutRef.current = undefined
      }
      
      const errorMessage = error.message || String(error)
      
      const isNetworkError = error.name === 'NetworkError' || 
                            errorMessage.includes('fetch') ||
                            errorMessage.includes('network') ||
                            errorMessage.includes('connection') ||
                            errorMessage.includes('timeout')
      
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
        displayError = 'Erro de conexão ou timeout. Verifique sua internet.'
      }
      
      if (!isSessionError && showToast) {
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

  const forceRefresh = async (showToast = true) => {
    console.log('Force refreshing subscription...')
    // Reset todos os controles para permitir nova verificação
    setRetryAttempts(0)
    setIsRateLimited(false)
    setLastCheckTime(0)
    if (rateLimitTimeoutRef.current) {
      clearTimeout(rateLimitTimeoutRef.current)
    }
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current)
    }
    setLoading(true)
    await checkSubscription(false, true, showToast)
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
      // Debounce inicial check
      timeoutRef.current = setTimeout(() => {
        checkSubscription()
      }, 500)
    } else {
      setLoading(false)
      setSubscriptionData({ subscribed: false })
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [user, session])

  // Auto-refresh subscription status every 5 minutes quando subscribed e ativo
  useEffect(() => {
    if (!user || !subscriptionData.subscribed || isRateLimited) return

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && !checking) {
        checkSubscription()
      }
    }, 300000) // 5 minutes

    return () => clearInterval(interval)
  }, [user, subscriptionData.subscribed, checking, isRateLimited])

  return {
    subscriptionData,
    loading,
    checking: checking || isRateLimited,
    checkSubscription: forceRefresh,
    createCheckout,
    openCustomerPortal,
  }
}
