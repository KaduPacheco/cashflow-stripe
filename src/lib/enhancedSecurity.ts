
import { SecureLogger } from '@/lib/logger'

// Função local para validar UUID
function validateUUID(uuid: string, context: string): void {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(uuid)) {
    throw new Error(`Invalid UUID in ${context}: ${uuid}`)
  }
}

// Sistema aprimorado de rate limiting
class EnhancedRateLimiter {
  private static attempts = new Map<string, { count: number; resetTime: number; blocked: boolean }>()
  
  // Diferentes limites por tipo de operação
  private static readonly LIMITS = {
    login: { max: 5, windowMs: 15 * 60 * 1000 }, // 5 tentativas em 15 min
    password_change: { max: 3, windowMs: 60 * 60 * 1000 }, // 3 tentativas em 1 hora
    api_request: { max: 100, windowMs: 60 * 1000 }, // 100 requests por minuto
    transaction_create: { max: 50, windowMs: 60 * 1000 } // 50 transações por minuto
  }

  static checkLimit(identifier: string, operation: keyof typeof this.LIMITS): boolean {
    const now = Date.now()
    const limit = this.LIMITS[operation]
    const key = `${operation}_${identifier}`
    
    const record = this.attempts.get(key)
    
    if (!record || now > record.resetTime) {
      // Reset ou criar novo registro
      this.attempts.set(key, {
        count: 1,
        resetTime: now + limit.windowMs,
        blocked: false
      })
      return true
    }
    
    if (record.count >= limit.max) {
      record.blocked = true
      SecureLogger.warn(`Rate limit exceeded for ${operation}`, { 
        identifier: '***MASKED***', 
        operation 
      })
      return false
    }
    
    record.count += 1
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

export { EnhancedRateLimiter }
