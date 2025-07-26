
import { supabase } from '@/lib/supabase'
import { SecureLogger } from '@/lib/logger'

export class EnhancedRateLimiter {
  private static readonly rateLimitStore = new Map<string, { count: number; resetTime: number }>()
  private static readonly DEFAULT_WINDOW_MS = 60 * 1000 // 1 minute
  private static readonly MAX_ATTEMPTS = {
    login: 5,
    password_change: 3,
    form_submission: 10,
    api_call: 60,
    api_request: 30 // Add support for api_request operation
  }

  static checkLimit(
    identifier: string, 
    operation: keyof typeof EnhancedRateLimiter.MAX_ATTEMPTS,
    customLimit?: number
  ): boolean {
    const now = Date.now()
    const key = `${operation}_${identifier}`
    const maxAttempts = customLimit || this.MAX_ATTEMPTS[operation]
    
    const record = this.rateLimitStore.get(key)
    
    if (!record || now > record.resetTime) {
      // Reset or create new record
      this.rateLimitStore.set(key, {
        count: 1,
        resetTime: now + this.DEFAULT_WINDOW_MS
      })
      return true
    }
    
    if (record.count >= maxAttempts) {
      // Use existing SecureLogger methods instead of non-existent security method
      SecureLogger.warn('Rate limit exceeded', { 
        operation, 
        identifier: identifier.slice(0, 3) + '***',
        attempts: record.count 
      })
      return false
    }
    
    record.count += 1
    return true
  }

  static clearAttempts(identifier: string, operation: keyof typeof EnhancedRateLimiter.MAX_ATTEMPTS): void {
    const key = `${operation}_${identifier}`
    this.rateLimitStore.delete(key)
  }

  static async logSecurityEvent(
    action: string,
    details: Record<string, any> = {}
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      await supabase.from('security_logs').insert({
        user_id: user?.id,
        action,
        details,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      SecureLogger.error('Failed to log security event', { error, action })
    }
  }

  // Cleanup old records periodically
  static cleanupOldRecords(): void {
    const now = Date.now()
    for (const [key, record] of this.rateLimitStore.entries()) {
      if (now > record.resetTime) {
        this.rateLimitStore.delete(key)
      }
    }
  }
}

// Security Headers utility
export class SecurityHeaders {
  static getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co"
      ].join('; ')
    }
  }
}

// Clean up old rate limit records every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    EnhancedRateLimiter.cleanupOldRecords()
  }, 5 * 60 * 1000)
}
