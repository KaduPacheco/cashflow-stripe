
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import type { User, Session } from '@supabase/supabase-js'
import { SubscriptionData } from './types'
import { getCachedSubscription, setCachedSubscription } from './cache'
import { getStatusMessage } from './statusMessages'

export const checkSubscription = async (
  user: User | null,
  session: Session | null,
  isRetry = false,
  skipRateCheck = false,
  showToast = false,
  forceRefresh = false,
  checking: boolean,
  isRateLimited: boolean,
  lastCheckTime: number,
  retryAttempts: number,
  checkTimeoutRef: React.MutableRefObject<NodeJS.Timeout | undefined>,
  rateLimitTimeoutRef: React.MutableRefObject<NodeJS.Timeout | undefined>,
  setChecking: (checking: boolean) => void,
  setLastCheckTime: (time: number) => void,
  setRetryAttempts: (attempts: number | ((prev: number) => number)) => void,
  setIsRateLimited: (limited: boolean) => void,
  setSubscriptionData: (data: SubscriptionData) => void,
  setLoading: (loading: boolean) => void
): Promise<void> => {
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
      const dataWithCacheFlag: SubscriptionData = {
        ...cachedData,
        fromCache: true
      }
      setSubscriptionData(dataWithCacheFlag)
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
            setTimeout(() => {
              checkSubscription(user, sessionData.session, true, true, showToast, forceRefresh, false, isRateLimited, lastCheckTime, retryAttempts, checkTimeoutRef, rateLimitTimeoutRef, setChecking, setLastCheckTime, setRetryAttempts, setIsRateLimited, setSubscriptionData, setLoading)
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
    
    // Marca que os dados não vieram do cache
    newSubscriptionData.fromCache = false
    
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
