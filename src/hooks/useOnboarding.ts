
import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'

const ONBOARDING_KEY = 'cashflow-onboarded'

export function useOnboarding() {
  const { user } = useAuth()
  const [showTour, setShowTour] = useState(false)
  const [isOnboarded, setIsOnboarded] = useState(true)

  useEffect(() => {
    if (user) {
      const onboarded = localStorage.getItem(ONBOARDING_KEY)
      const userOnboarded = onboarded === 'true'
      
      setIsOnboarded(userOnboarded)
      
      if (!userOnboarded) {
        // Delay para garantir que a UI esteja completamente carregada
        setTimeout(() => {
          setShowTour(true)
        }, 1000)
      }
    }
  }, [user])

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true')
    setIsOnboarded(true)
    setShowTour(false)
  }

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_KEY)
    setIsOnboarded(false)
  }

  return {
    showTour,
    isOnboarded,
    completeOnboarding,
    resetOnboarding,
  }
}
