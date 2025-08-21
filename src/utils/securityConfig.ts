
// Security configuration utilities and validation
import { supabase } from '@/lib/supabase'
import { SecureLogger } from '@/lib/logger'

export class SecurityConfigValidator {
  /**
   * Validate current security configuration
   */
  static async validateSecuritySettings(): Promise<{
    isSecure: boolean
    issues: string[]
    recommendations: string[]
  }> {
    const issues: string[] = []
    const recommendations: string[] = []

    try {
      // Check if user is authenticated
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        issues.push('User not authenticated for security check')
        return { isSecure: false, issues, recommendations }
      }

      // Check session validity
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        issues.push('No valid session found')
      }

      // Validate RLS is working (test with a simple query)
      try {
        const { error: rlsError } = await supabase
          .from('profiles')
          .select('id')
          .limit(1)

        if (rlsError) {
          issues.push('RLS validation failed: ' + rlsError.message)
        }
      } catch (rlsError) {
        issues.push('RLS test query failed')
      }

      // Security recommendations
      recommendations.push('Enable leaked password protection in Supabase Auth settings')
      recommendations.push('Set OTP expiry to 10 minutes in Authentication settings')
      recommendations.push('Review and audit database extensions in public schema')
      recommendations.push('Regularly audit RLS policies for effectiveness')

      const isSecure = issues.length === 0

      SecureLogger.auth('Security configuration validated', {
        isSecure,
        issueCount: issues.length,
        userId: '***MASKED***'
      })

      return { isSecure, issues, recommendations }

    } catch (error) {
      SecureLogger.error('Security validation failed', error)
      issues.push('Security validation process failed')
      return { isSecure: false, issues, recommendations }
    }
  }

  /**
   * Enhanced security monitoring
   */
  static async logSecurityEvent(
    eventType: 'login' | 'logout' | 'password_change' | 'suspicious_activity' | 'config_change',
    details: Record<string, any> = {}
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Log to our security audit system
      await supabase.rpc('log_security_event', {
        p_action: eventType,
        p_table_name: 'security_audit',
        p_success: true,
        p_details: {
          ...details,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        }
      })

      SecureLogger.auth(`Security event: ${eventType}`, {
        eventType,
        userId: user?.id ? '***MASKED***' : 'anonymous',
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      SecureLogger.error('Failed to log security event', error)
    }
  }

  /**
   * Check for potential security violations
   */
  static detectSuspiciousActivity(
    action: string,
    metadata: Record<string, any>
  ): boolean {
    const suspiciousPatterns = [
      // Multiple rapid requests
      /rapid_requests/i,
      // SQL injection attempts
      /union|select|insert|update|delete|drop|create|alter/i,
      // XSS attempts
      /<script|javascript:|on\w+=/i,
      // Path traversal
      /\.\.|\/etc\/|\/proc\//i
    ]

    const dataString = JSON.stringify({ action, ...metadata })
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(dataString)) {
        this.logSecurityEvent('suspicious_activity', {
          action,
          pattern: pattern.source,
          metadata: this.maskSensitiveData(metadata)
        })
        return true
      }
    }

    return false
  }

  /**
   * Mask sensitive data for logging
   */
  private static maskSensitiveData(data: any): any {
    if (!data || typeof data !== 'object') return data

    const masked = { ...data }
    const sensitiveFields = ['password', 'token', 'email', 'phone', 'cpf', 'documento']

    for (const field of sensitiveFields) {
      if (masked[field]) {
        masked[field] = '***MASKED***'
      }
    }

    return masked
  }
}

// Security configuration constants
export const SECURITY_CONFIG = {
  PASSWORD_REQUIREMENTS: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true
  },
  SESSION_CONFIG: {
    maxInactiveTime: 60 * 60 * 1000, // 1 hour
    maxSessionTime: 24 * 60 * 60 * 1000, // 24 hours
    refreshThreshold: 5 * 60 * 1000 // 5 minutes
  },
  RATE_LIMITS: {
    loginAttempts: 5,
    passwordChangeAttempts: 3,
    apiRequests: 100
  }
} as const
