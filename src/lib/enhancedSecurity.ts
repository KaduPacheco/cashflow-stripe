
import { SecureLogger } from '@/lib/logger'
import { supabase } from '@/lib/supabase'

// Função local para validar UUID
function validateUUID(uuid: string, context: string): void {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(uuid)) {
    throw new Error(`Invalid UUID in ${context}: ${uuid}`)
  }
}

// Sistema aprimorado de rate limiting com persistência
class EnhancedRateLimiter {
  private static attempts = new Map<string, { count: number; resetTime: number; blocked: boolean }>()
  
  // Diferentes limites por tipo de operação
  private static readonly LIMITS = {
    login: { max: 5, windowMs: 15 * 60 * 1000 }, // 5 tentativas em 15 min
    password_change: { max: 3, windowMs: 60 * 60 * 1000 }, // 3 tentativas em 1 hora
    api_request: { max: 100, windowMs: 60 * 1000 }, // 100 requests por minuto
    transaction_create: { max: 50, windowMs: 60 * 1000 }, // 50 transações por minuto
    form_submission: { max: 20, windowMs: 60 * 1000 } // 20 submissões por minuto
  }

  static async checkLimit(identifier: string, operation: keyof typeof this.LIMITS): Promise<boolean> {
    const now = Date.now()
    const limit = this.LIMITS[operation]
    const key = `${operation}_${identifier}`
    
    // Try to get from database first for persistence
    try {
      const { data: rateLimitData } = await supabase
        .from('security_logs')
        .select('details')
        .eq('action', 'rate_limit')
        .eq('table_name', key)
        .gte('created_at', new Date(now - limit.windowMs).toISOString())
        .order('created_at', { ascending: false })
        .limit(limit.max)

      if (rateLimitData && rateLimitData.length >= limit.max) {
        SecureLogger.warn(`Rate limit exceeded for ${operation}`, { 
          identifier: '***MASKED***', 
          operation,
          count: rateLimitData.length
        })
        return false
      }
    } catch (error) {
      // Fallback to in-memory if database fails
      SecureLogger.warn('Rate limit database check failed, using in-memory fallback', { error })
    }

    // Update in-memory cache
    const record = this.attempts.get(key)
    
    if (!record || now > record.resetTime) {
      // Reset ou criar novo registro
      this.attempts.set(key, {
        count: 1,
        resetTime: now + limit.windowMs,
        blocked: false
      })
      
      // Log to database
      try {
        await supabase
          .from('security_logs')
          .insert({
            action: 'rate_limit',
            table_name: key,
            success: true,
            details: { operation, count: 1 }
          })
      } catch (error) {
        SecureLogger.error('Failed to log rate limit event', { error })
      }
      
      return true
    }
    
    if (record.count >= limit.max) {
      record.blocked = true
      SecureLogger.warn(`Rate limit exceeded for ${operation}`, { 
        identifier: '***MASKED***', 
        operation,
        count: record.count
      })
      return false
    }
    
    record.count += 1
    
    // Log to database
    try {
      await supabase
        .from('security_logs')
        .insert({
          action: 'rate_limit',
          table_name: key,
          success: true,
          details: { operation, count: record.count }
        })
    } catch (error) {
      SecureLogger.error('Failed to log rate limit event', { error })
    }
    
    return true
  }

  static isBlocked(identifier: string, operation: keyof typeof this.LIMITS): boolean {
    const key = `${operation}_${identifier}`
    const record = this.attempts.get(key)
    return record?.blocked || false
  }

  static clearAttempts(identifier: string, operation: keyof typeof this.LIMITS): void {
    const key = `${operation}_${identifier}`
    this.attempts.delete(key)
  }
}

// Headers de segurança aprimorados
export const createEnhancedSecurityHeaders = (): Record<string, string> => {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "connect-src 'self' https://csvkgokkvbtojjkitodc.supabase.co wss://csvkgokkvbtojjkitodc.supabase.co",
      "font-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ')
  }
}

// Validador de UUID aprimorado
export const validateUserUUID = (uuid: string, context: string): boolean => {
  try {
    validateUUID(uuid, context)
    return true
  } catch (error: any) {
    SecureLogger.error(`Invalid UUID in ${context}`, { error: error.message })
    return false
  }
}

// Security monitoring utilities
export const SecurityMonitor = {
  async logSecurityEvent(
    action: string,
    details: Record<string, any>,
    success: boolean = true
  ): Promise<void> {
    try {
      await supabase
        .from('security_logs')
        .insert({
          action,
          table_name: 'security_monitor',
          success,
          details
        })
    } catch (error) {
      SecureLogger.error('Failed to log security event', { error, action })
    }
  },

  async checkSuspiciousActivity(userId: string): Promise<boolean> {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      
      const { data: logs } = await supabase
        .from('security_logs')
        .select('action, success')
        .eq('user_id', userId)
        .gte('created_at', oneHourAgo.toISOString())
        .order('created_at', { ascending: false })

      if (!logs) return false

      const failedAttempts = logs.filter(log => !log.success).length
      const suspiciousThreshold = 10

      return failedAttempts > suspiciousThreshold
    } catch (error) {
      SecureLogger.error('Failed to check suspicious activity', { error })
      return false
    }
  }
}

export { EnhancedRateLimiter }
