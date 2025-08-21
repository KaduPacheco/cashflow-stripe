
import { supabase } from '@/lib/supabase'
import { SecureLogger } from '@/lib/logger'
import { validateAuthentication, validateResourceOwnership, sanitizeInput } from '@/lib/security'

export class SecurityAuditService {
  /**
   * Validate user session and ownership before any sensitive operation
   */
  static async validateUserAccess(resourceId?: string, resourceUserId?: string) {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (sessionError || userError || !user || !session) {
      throw new Error('Authentication required')
    }
    
    validateAuthentication(user, session)
    
    if (resourceId && resourceUserId) {
      validateResourceOwnership(resourceUserId, user.id)
    }
    
    return { user, session }
  }

  /**
   * Sanitize all text inputs before processing
   */
  static sanitizeUserInputs(data: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {}
    
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeInput(value)
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        sanitized[key] = this.sanitizeUserInputs(value)
      } else {
        sanitized[key] = value
      }
    }
    
    return sanitized
  }

  /**
   * Log security-sensitive operations
   */
  static async logSecurityOperation(
    operation: string,
    userId: string,
    resourceType: string,
    resourceId?: string,
    success: boolean = true,
    details?: Record<string, any>
  ) {
    try {
      SecureLogger.auth('Security operation', {
        operation,
        userId: '***MASKED***',
        resourceType,
        resourceId,
        success,
        details
      })

      // Also log to database for audit trail
      await supabase.rpc('log_security_event', {
        p_action: operation,
        p_table_name: resourceType,
        p_record_id: resourceId,
        p_success: success,
        p_details: details
      })
    } catch (error) {
      SecureLogger.error('Failed to log security operation', error)
    }
  }

  /**
   * Enhanced data masking for logging
   */
  static maskSensitiveData(data: any): any {
    if (!data || typeof data !== 'object') return data

    const masked = { ...data }
    const sensitiveFields = ['email', 'password', 'token', 'phone', 'cpf', 'documento']

    for (const field of sensitiveFields) {
      if (masked[field]) {
        masked[field] = '***MASKED***'
      }
    }

    return masked
  }
}
