
// Sistema de logs seguros com níveis e mascaramento de dados sensíveis
interface LogLevel {
  DEVELOPMENT: 'development'
  PRODUCTION: 'production'
}

const LOG_LEVELS: LogLevel = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production'
}

const CURRENT_ENV = import.meta.env.MODE || 'development'

// Dados sensíveis que devem ser mascarados em produção
const SENSITIVE_KEYS = [
  'password', 'token', 'access_token', 'refresh_token', 'api_key', 
  'secret', 'auth', 'authorization', 'session', 'cookie', 'email',
  'phone', 'whatsapp', 'document', 'cpf', 'cnpj'
]

function maskSensitiveData(data: any): any {
  if (CURRENT_ENV === LOG_LEVELS.PRODUCTION) {
    if (typeof data === 'object' && data !== null) {
      const masked = { ...data }
      
      for (const key in masked) {
        if (SENSITIVE_KEYS.some(sensitiveKey => 
          key.toLowerCase().includes(sensitiveKey.toLowerCase())
        )) {
          if (typeof masked[key] === 'string') {
            masked[key] = masked[key].length > 0 ? '***MASKED***' : ''
          } else if (masked[key] !== null && masked[key] !== undefined) {
            masked[key] = '***MASKED***'
          }
        } else if (typeof masked[key] === 'object') {
          masked[key] = maskSensitiveData(masked[key])
        }
      }
      
      return masked
    }
  }
  
  return data
}

export const SecureLogger = {
  info: (message: string, data?: any) => {
    const maskedData = maskSensitiveData(data)
    console.log(`[INFO] ${message}`, maskedData || '')
  },
  
  error: (message: string, error?: any) => {
    const maskedError = maskSensitiveData(error)
    console.error(`[ERROR] ${message}`, maskedError || '')
  },
  
  warn: (message: string, data?: any) => {
    const maskedData = maskSensitiveData(data)
    console.warn(`[WARN] ${message}`, maskedData || '')
  },
  
  debug: (message: string, data?: any) => {
    if (CURRENT_ENV === LOG_LEVELS.DEVELOPMENT) {
      console.debug(`[DEBUG] ${message}`, data || '')
    }
  },
  
  auth: (message: string, data?: any) => {
    // Logs de autenticação sempre mascarados
    const maskedData = maskSensitiveData(data)
    console.log(`[AUTH] ${message}`, maskedData || '')
  },

  security: (message: string, data?: any) => {
    const maskedData = maskSensitiveData(data)
    console.log(`[SECURITY] ${message}`, maskedData || '')
    
    // Also log to console for development
    if (CURRENT_ENV === LOG_LEVELS.DEVELOPMENT) {
      console.log(`🔒 [SECURITY] ${message}`, maskedData)
    }
  }
}

export class EnhancedSecureLogger {
  /**
   * Enhanced security logging with data masking
   */
  static security(message: string, data?: any): void {
    const maskedData = this.maskSecurityData(data)
    SecureLogger.security(`${message}`, maskedData)
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
    SecureLogger.error(`SECURITY VIOLATION: ${violation}`, this.maskSecurityData(details))
    
    // In production, this could trigger alerts
    if (CURRENT_ENV === LOG_LEVELS.PRODUCTION) {
      // TODO: Integrate with monitoring service
      console.error(`🚨 SECURITY VIOLATION: ${violation}`)
    }
  }
}
