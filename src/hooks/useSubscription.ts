
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { clearSubscriptionCache, shouldShowSplash, wasCheckedToday } from './subscription/cache'
import { checkSubscription } from './subscription/subscriptionChecker'
import { createCheckout, openCustomerPortal } from './subscription/paymentOperations'
import type { SubscriptionData } from './subscription/types'

export type { SubscriptionData }

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
  const [showSplash, setShowSplash] = useState(false)
  
  const timeoutRef = useRef<NodeJS.Timeout>()
  const rateLimitTimeoutRef = useRef<NodeJS.Timeout>()
  const checkTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (rateLimitTimeoutRef.current) clearTimeout(rateLimitTimeoutRef.current)
      if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current)
    }
  }, [])

  const handleCheckSubscription = async (isRetry = false, skipRateCheck = false, showToast = false, forceRefresh = false) => {
    await checkSubscription(
      user,
      session,
      isRetry,
      skipRateCheck,
      showToast,
      forceRefresh,
      checking,
      isRateLimited,
      lastCheckTime,
      retryAttempts,
      checkTimeoutRef,
      rateLimitTimeoutRef,
      setChecking,
      setLastCheckTime,
      setRetryAttempts,
      setIsRateLimited,
      setSubscriptionData,
      setLoading
    )
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
    await handleCheckSubscription(false, true, showToast, true)
  }

  const handleCreateCheckout = () => createCheckout(user, session)
  const handleOpenCustomerPortal = () => openCustomerPortal(user, session)

  useEffect(() => {
    if (session && user) {
      // Determina se deve mostrar splash baseado no cache
      const shouldShow = shouldShowSplash(user.id)
      setShowSplash(shouldShow)
      
      // Se já foi verificado hoje, não mostra splash e usa cache se disponível
      if (!shouldShow) {
        console.log('Subscription already checked today, using cache')
        setLoading(false)
      }
      
      timeoutRef.current = setTimeout(() => {
        handleCheckSubscription()
      }, shouldShow ? 500 : 100) // Delay menor se não precisa mostrar splash
    } else {
      setLoading(false)
      setShowSplash(false)
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

  // Revalidação em background usando stale-while-revalidate
  useEffect(() => {
    if (!user || !subscriptionData.subscribed || isRateLimited) return

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && !checking) {
        // Apenas revalida se não foi verificado hoje
        if (!wasCheckedToday(user.id)) {
          console.log('Background revalidation triggered')
          handleCheckSubscription(false, false, false, false)
        }
      }
    }, 300000) // 5 minutes

    return () => clearInterval(interval)
  }, [user, subscriptionData.subscribed, checking, isRateLimited])

  return {
    subscriptionData,
    loading: loading && showSplash, // Só mostra loading se deve mostrar splash
    checking: checking || isRateLimited,
    showSplash,
    checkSubscription: forceRefresh,
    createCheckout: handleCreateCheckout,
    openCustomerPortal: handleOpenCustomerPortal,
  }
}
