
import { SecureLogger } from './logger'

export class EnhancedSecureLogger extends SecureLogger {
  /**
   * Enhanced security logging with data masking
   */
  static security(message: string, data?: any): void {
    const maskedData = this.maskSecurityData(data)
    super.info(`[SECURITY] ${message}`, maskedData)
    
    // Also log to console for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔒 [SECURITY] ${message}`, maskedData)
    }
  }

  /**
   * Log authentication events with extra security
   */
  static authEvent(event: string, userId?: string, details?: any): void {
    const maskedDetails = this.maskSecurityData(details)
    this.security(`Auth: ${event}`, {
      userId: userId ? '***MASKED***' : undefined,
      ...maskedDetails
    })
  }

  /**
   * Log data access events
   */
  static dataAccess(action: string, table: string, userId: string, recordId?: string): void {
    this.security(`Data Access: ${action}`, {
      table,
      userId: '***MASKED***',
      recordId,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Mask sensitive data for logging
   */
  private static maskSecurityData(data: any): any {
    if (!data || typeof data !== 'object') return data

    const masked = { ...data }
    const sensitiveFields = [
      'password', 'token', 'secret', 'key', 'email', 'phone', 
      'cpf', 'documento', 'api_key', 'access_token', 'refresh_token'
    ]

    const maskValue = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map(maskValue)
      }
      
      if (obj && typeof obj === 'object') {
        const result: any = {}
        for (const [key, value] of Object.entries(obj)) {
          if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
            result[key] = '***MASKED***'
          } else {
            result[key] = maskValue(value)
          }
        }
        return result
      }
      
      return obj
    }

    return maskValue(masked)
  }

  /**
   * Log security violations
   */
  static securityViolation(violation: string, details: any): void {
    this.error(`SECURITY VIOLATION: ${violation}`, this.maskSecurityData(details))
    
    // In production, this could trigger alerts
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrate with monitoring service
      console.error(`🚨 SECURITY VIOLATION: ${violation}`)
    }
  }
}
