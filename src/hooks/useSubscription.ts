
import { useState, useEffect, useRef, useCallback } from 'react'
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
  const [lastCheckTime, setLastCheckTime] = useState<number>(0)
  const [isRateLimited, setIsRateLimited] = useState(false)
  
  // Refs para controlar timeouts e evitar memory leaks
  const timeoutRef = useRef<NodeJS.Timeout>()
  const rateLimitTimeoutRef = useRef<NodeJS.Timeout>()
  const checkTimeoutRef = useRef<NodeJS.Timeout>()
  const abortControllerRef = useRef<AbortController>()

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (rateLimitTimeoutRef.current) clearTimeout(rateLimitTimeoutRef.current)
      if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current)
      if (abortControllerRef.current) abortControllerRef.current.abort()
    }
  }, [])

  const getStatusMessage = useCallback((status: string, subscribed: boolean): string => {
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
  }, [])

  const checkSubscription = useCallback(async (forceCheck = false) => {
    console.log('🔍 Checking subscription...', { user: !!user, session: !!session, isRateLimited, forceCheck })
    
    // Prevent multiple simultaneous checks
    if (checking && !forceCheck) {
      console.log('Already checking, skipping')
      return
    }

    // Rate limiting check
    if (isRateLimited && !forceCheck) {
      console.log('Rate limited, skipping check')
      return
    }

    // Frequency control - minimum 5 seconds between checks
    const now = Date.now()
    const timeSinceLastCheck = now - lastCheckTime
    if (timeSinceLastCheck < 5000 && !forceCheck) {
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

    // Check if token is close to expiration (within 5 minutes)
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
      
      // Cancel previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      
      abortControllerRef.current = new AbortController()
      
      console.log('Making subscription check request...')
      
      const checkPromise = supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })
      
      const timeoutPromise = new Promise((_, reject) => {
        checkTimeoutRef.current = setTimeout(() => {
          reject(new Error('Verificação de assinatura expirou. Tente novamente.'))
        }, 12000) // 12 seconds timeout
      })
      
      const { data, error } = await Promise.race([checkPromise, timeoutPromise]) as any
      
      // Clear timeout if completed
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current)
        checkTimeoutRef.current = undefined
      }
      
      if (error) {
        console.error('Error checking subscription:', error)
        
        const errorMessage = error.message || String(error)
        
        // Handle timeout
        if (errorMessage.includes('expirou') || errorMessage.includes('timeout')) {
          setSubscriptionData({ 
            subscribed: false, 
            error: 'Verificação demorou muito. Tente novamente em alguns segundos.',
            errorType: 'service'
          })
          return
        }
        
        // Handle rate limiting
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
          
          // 60 second backoff
          rateLimitTimeoutRef.current = setTimeout(() => {
            console.log('Rate limit period expired, re-enabling checks')
            setIsRateLimited(false)
          }, 60000)
          
          return
        }
        
        // Handle session errors
        const isSessionError = errorMessage.includes('session') || 
                              errorMessage.includes('token') ||
                              errorMessage.includes('unauthorized') ||
                              errorMessage.includes('User not authenticated')
        
        if (isSessionError) {
          console.log('Session error detected, signing out...')
          await signOut()
          return
        }
        
        // Generic error
        setSubscriptionData({ 
          subscribed: false, 
          error: 'Erro ao verificar assinatura',
          errorType: 'service'
        })
        return
      }
      
      console.log('✅ Subscription check result:', data)
      
      const newSubscriptionData: SubscriptionData = {
        subscribed: data.subscribed || false,
        subscription_tier: data.subscription_tier,
        subscription_end: data.subscription_end,
        subscription_id: data.subscription_id,
        status: data.status || (data.subscribed ? 'active' : 'inactive'),
        message: getStatusMessage(data.status || '', data.subscribed || false),
        error: data.error,
        errorType: data.errorType
      }
      
      setSubscriptionData(newSubscriptionData)
      
    } catch (error: any) {
      console.error('Subscription check failed:', error)
      
      if (error.name === 'AbortError') {
        console.log('Request was aborted')
        return
      }
      
      setSubscriptionData({ 
        subscribed: false,
        error: 'Erro na verificação de assinatura',
        errorType: 'unknown'
      })
    } finally {
      setChecking(false)
      setLoading(false)
    }
  }, [user?.id, session?.access_token, session?.expires_at, isRateLimited, lastCheckTime, getStatusMessage, signOut, checking])

  // Initial check and auth state changes
  useEffect(() => {
    if (user && session) {
      console.log('🔄 User authenticated, checking subscription')
      checkSubscription(true) // Force initial check
    } else {
      setSubscriptionData({ subscribed: false })
      setLoading(false)
    }
  }, [user?.id, session?.access_token, checkSubscription])

  // Periodic check every 5 minutes for active users
  useEffect(() => {
    if (!user || !session || !subscriptionData.subscribed) return

    const interval = setInterval(() => {
      checkSubscription()
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [user?.id, session?.access_token, subscriptionData.subscribed, checkSubscription])

  const refetchSubscription = useCallback(() => {
    console.log('🔄 Manual subscription refetch requested')
    checkSubscription(true)
  }, [checkSubscription])

  const createCheckoutSession = useCallback(async () => {
    if (!user || !session?.access_token) {
      toast.error('Você precisa estar logado para assinar')
      return null
    }

    try {
      console.log('Creating checkout session...')
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (error) {
        console.error('Checkout error:', error)
        toast.error('Erro ao criar sessão de pagamento')
        return null
      }

      return data
    } catch (error) {
      console.error('Checkout session error:', error)
      toast.error('Erro ao processar pagamento')
      return null
    }
  }, [user?.id, session?.access_token])

  const openCustomerPortal = useCallback(async () => {
    if (!user || !session?.access_token) {
      toast.error('Você precisa estar logado')
      return
    }

    try {
      console.log('Opening customer portal...')
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (error) {
        console.error('Customer portal error:', error)
        toast.error('Erro ao abrir portal do cliente')
        return
      }

      if (data?.url) {
        window.open(data.url, '_blank')
      }
    } catch (error) {
      console.error('Customer portal error:', error)
      toast.error('Erro ao abrir portal do cliente')
    }
  }, [user?.id, session?.access_token])

  return {
    subscriptionData,
    loading,
    checking,
    refetch: refetchSubscription,
    createCheckoutSession,
    openCustomerPortal,
    isRateLimited
  }
}
