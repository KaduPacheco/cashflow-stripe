
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

interface CachedSubscriptionData extends SubscriptionData {
  cachedAt: number
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
  
  const timeoutRef = useRef<NodeJS.Timeout>()
  const rateLimitTimeoutRef = useRef<NodeJS.Timeout>()
  const checkTimeoutRef = useRef<NodeJS.Timeout>()

  // Cache duration: 24 horas (em milissegundos)
  const CACHE_DURATION = 24 * 60 * 60 * 1000

  const getCacheKey = (userId: string) => `subscription_cache_${userId}`

  const getCachedSubscription = (userId: string): CachedSubscriptionData | null => {
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

  const setCachedSubscription = (userId: string, data: SubscriptionData) => {
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

  const clearSubscriptionCache = (userId?: string) => {
    try {
      if (userId) {
        localStorage.removeItem(getCacheKey(userId))
      } else if (user?.id) {
        localStorage.removeItem(getCacheKey(user.id))
      }
      console.log('Subscription cache cleared')
    } catch (error) {
      console.error('Error clearing subscription cache:', error)
    }
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (rateLimitTimeoutRef.current) clearTimeout(rateLimitTimeoutRef.current)
      if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current)
    }
  }, [])

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

  const checkSubscription = async (isRetry = false, skipRateCheck = false, showToast = false, forceRefresh = false) => {
    console.log('Checking subscription...', { user: !!user, session: !!session, isRetry, isRateLimited, forceRefresh })
    
    if (isRateLimited && !skipRateCheck) {
      console.log('Rate limited, skipping check')
      return
    }

    if (checking && !skipRateCheck) {
      console.log('Already checking, skipping')
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

    // Verifica cache apenas se não for um refresh forçado
    if (!forceRefresh) {
      const cachedData = getCachedSubscription(user.id)
      if (cachedData) {
        setSubscriptionData(cachedData)
        setLoading(false)
        console.log('Loaded subscription from cache')
        return
      }
    }

    const now = Date.now()
    const timeSinceLastCheck = now - lastCheckTime
    if (timeSinceLastCheck < 2000 && !skipRateCheck && !isRetry && !forceRefresh) {
      console.log('Too frequent, skipping check')
      return
    }

    // Validação de sessão menos restritiva
    if (session.expires_at) {
      const expiresAt = session.expires_at * 1000
      const tenMinutes = 10 * 60 * 1000
      
      if (expiresAt - now < tenMinutes) {
        console.log('Token close to expiration, refreshing session...')
        try {
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
          if (refreshError || !refreshData.session) {
            console.log('Session refresh failed, but continuing with current session')
          }
        } catch (error) {
          console.log('Session refresh error, but continuing with current session:', error)
        }
      }
    }

    try {
      setChecking(true)
      setLastCheckTime(now)
      console.log('Making subscription check request...')
      
      const checkPromise = supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })
      
      const timeoutPromise = new Promise((_, reject) => {
        checkTimeoutRef.current = setTimeout(() => {
          reject(new Error('Verificação de assinatura expirou. Tente novamente.'))
        }, 20000)
      })
      
      const { data, error } = await Promise.race([checkPromise, timeoutPromise]) as any
      
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current)
        checkTimeoutRef.current = undefined
      }
      
      if (error) {
        console.error('Error checking subscription:', error)
        
        const errorMessage = error.message || String(error)
        
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
        
        const isSessionError = errorMessage.includes('session') || 
                              errorMessage.includes('token') ||
                              errorMessage.includes('unauthorized') ||
                              errorMessage.includes('User not authenticated') ||
                              errorMessage.includes('Authentication error')
        
        const isNetworkError = errorMessage.includes('NetworkError') || 
                              errorMessage.includes('fetch') ||
                              errorMessage.includes('network') ||
                              errorMessage.includes('connection') ||
                              error.name === 'NetworkError'
        
        if (isSessionError && !isRetry && retryAttempts < 1) {
          console.log('Session error detected, attempting session refresh...')
          setRetryAttempts(prev => prev + 1)
          
          try {
            const { data: sessionData, error: refreshError } = await supabase.auth.refreshSession()
            
            if (!refreshError && sessionData.session) {
              console.log('Session refreshed successfully, retrying...')
              timeoutRef.current = setTimeout(() => {
                checkSubscription(true, true, showToast)
              }, 1000)
              return
            } else {
              console.log('Session refresh failed, continuing without retry')
            }
          } catch (refreshErr) {
            console.log('Session refresh error, continuing without retry:', refreshErr)
          }
        }
        
        let errorType: SubscriptionData['errorType'] = 'unknown'
        let displayError = 'Erro ao verificar assinatura'
        
        if (isSessionError) {
          errorType = 'session'
          displayError = 'Problema na validação da sessão'
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
          displayError = 'Problema na validação da sessão'
        }
        
        setSubscriptionData({ 
          subscribed: false,
          error: displayError,
          errorType
        })
        return
      }
      
      setRetryAttempts(0)
      setIsRateLimited(false)
      if (rateLimitTimeoutRef.current) {
        clearTimeout(rateLimitTimeoutRef.current)
      }
      
      const newSubscriptionData = data || { subscribed: false }
      
      if (newSubscriptionData.status) {
        newSubscriptionData.message = getStatusMessage(newSubscriptionData.status, newSubscriptionData.subscribed)
      }
      
      setSubscriptionData(newSubscriptionData)
      
      // Cache os dados para evitar requisições desnecessárias
      setCachedSubscription(user.id, newSubscriptionData)
      
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
        displayError = 'Problema na validação da sessão'
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
    setRetryAttempts(0)
    setIsRateLimited(false)
    setLastCheckTime(0)
    if (rateLimitTimeoutRef.current) {
      clearTimeout(rateLimitTimeoutRef.current)
    }
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current)
    }
    // Limpa o cache para forçar nova verificação
    if (user?.id) {
      clearSubscriptionCache(user.id)
    }
    setLoading(true)
    await checkSubscription(false, true, showToast, true)
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

  // Limpa o cache quando o usuário faz logout
  useEffect(() => {
    if (!user && subscriptionData.subscribed) {
      clearSubscriptionCache()
      setSubscriptionData({ subscribed: false })
    }
  }, [user])

  // Intervalo de verificação apenas se não há dados em cache válidos
  useEffect(() => {
    if (!user || !subscriptionData.subscribed || isRateLimited) return

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && !checking) {
        // Verifica se ainda há cache válido antes de fazer nova requisição
        const cachedData = getCachedSubscription(user.id)
        if (!cachedData) {
          checkSubscription()
        }
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
