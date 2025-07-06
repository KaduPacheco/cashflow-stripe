
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { clearSubscriptionCache } from './subscription/cache'
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
      timeoutRef.current = setTimeout(() => {
        handleCheckSubscription()
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
        const { getCachedSubscription } = require('./subscription/cache')
        const cachedData = getCachedSubscription(user.id)
        if (!cachedData) {
          handleCheckSubscription()
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
    createCheckout: handleCreateCheckout,
    openCustomerPortal: handleOpenCustomerPortal,
  }
}
