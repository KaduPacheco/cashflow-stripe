
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { SecurityConfigValidator } from '@/utils/securityConfig'
import { SecureLogger } from '@/lib/logger'

export function useSecurityMonitor() {
  const { user, session } = useAuth()
  const [securityEvents, setSecurityEvents] = useState<Array<{
    id: string
    type: string
    timestamp: Date
    details: Record<string, any>
  }>>([])

  const logSecurityEvent = useCallback(async (
    eventType: 'login' | 'logout' | 'password_change' | 'suspicious_activity' | 'config_change',
    details: Record<string, any> = {}
  ) => {
    if (!user) return

    try {
      await SecurityConfigValidator.logSecurityEvent(eventType, details)
      
      // Add to local state for immediate feedback
      const newEvent = {
        id: crypto.randomUUID(),
        type: eventType,
        timestamp: new Date(),
        details
      }
      
      setSecurityEvents(prev => [newEvent, ...prev.slice(0, 49)]) // Keep last 50 events
      
      SecureLogger.auth('Security event logged', { eventType, userId: '***MASKED***' })
    } catch (error) {
      SecureLogger.error('Failed to log security event', error)
    }
  }, [user])

  const checkSuspiciousActivity = useCallback((
    action: string,
    metadata: Record<string, any>
  ): boolean => {
    return SecurityConfigValidator.detectSuspiciousActivity(action, metadata)
  }, [])

  // Monitor authentication state changes
  useEffect(() => {
    if (user && session) {
      logSecurityEvent('login', {
        method: 'session_restored',
        timestamp: new Date().toISOString()
      })
    }
  }, [user, session, logSecurityEvent])

  // Monitor for suspicious activity patterns
  useEffect(() => {
    let requestCount = 0
    let lastReset = Date.now()

    const monitorRequests = () => {
      requestCount++
      
      // Reset counter every minute
      if (Date.now() - lastReset > 60000) {
        requestCount = 0
        lastReset = Date.now()
      }
      
      // Flag suspicious activity if too many requests
      if (requestCount > 100) {
        checkSuspiciousActivity('rapid_requests', {
          requestCount,
          timeWindow: '1_minute'
        })
      }
    }

    // Monitor fetch requests
    const originalFetch = window.fetch
    window.fetch = (...args) => {
      monitorRequests()
      return originalFetch(...args)
    }

    return () => {
      window.fetch = originalFetch
    }
  }, [checkSuspiciousActivity])

  return {
    securityEvents,
    logSecurityEvent,
    checkSuspiciousActivity
  }
}
