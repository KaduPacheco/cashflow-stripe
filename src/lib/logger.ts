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
    
    // Enviar para Sentry apenas eventos importantes em produção
    if (CURRENT_ENV === LOG_LEVELS.PRODUCTION && shouldLogToSentry(message)) {
      SentryLogger.captureEvent(message, 'info', maskedData)
    }
  },
  
  error: (message: string, error?: any) => {
    const maskedError = maskSensitiveData(error)
    console.error(`[ERROR] ${message}`, maskedError || '')
    
    // Sempre enviar erros para o Sentry em produção
    if (CURRENT_ENV === LOG_LEVELS.PRODUCTION) {
      const errorInstance = error instanceof Error ? error : new Error(message)
      SentryLogger.captureError(errorInstance, maskedError)
    }
  },
  
  warn: (message: string, data?: any) => {
    const maskedData = maskSensitiveData(data)
    console.warn(`[WARN] ${message}`, maskedData || '')
    
    // Enviar warnings importantes para o Sentry
    if (CURRENT_ENV === LOG_LEVELS.PRODUCTION && shouldLogWarningToSentry(message)) {
      SentryLogger.captureEvent(message, 'warning', maskedData)
    }
  },
  
  debug: (message: string, data?: any) => {
    if (CURRENT_ENV === LOG_LEVELS.DEVELOPMENT) {
      console.debug(`[DEBUG] ${message}`, data || '')
    }
    // Debug logs nunca vão para o Sentry
  },
  
  auth: (message: string, data?: any) => {
    // Logs de autenticação sempre mascarados
    const maskedData = maskSensitiveData(data)
    console.log(`[AUTH] ${message}`, maskedData || '')
    
    // Enviar eventos de autenticação importantes para o Sentry
    if (CURRENT_ENV === LOG_LEVELS.PRODUCTION && shouldLogAuthToSentry(message)) {
      SentryLogger.captureEvent(`Auth: ${message}`, 'info', maskedData)
    }
  }
}

// Determinar se deve enviar logs info para o Sentry
function shouldLogToSentry(message: string): boolean {
  const importantEvents = [
    'application initialized',
    'subscription',
    'payment',
    'critical error'
  ]
  
  return importantEvents.some(event => 
    message.toLowerCase().includes(event.toLowerCase())
  )
}

// Determinar se deve enviar warnings para o Sentry
function shouldLogWarningToSentry(message: string): boolean {
  const importantWarnings = [
    'security',
    'rate limit',
    'validation failed',
    'unauthorized'
  ]
  
  return importantWarnings.some(warning => 
    message.toLowerCase().includes(warning.toLowerCase())
  )
}

// Determinar se deve enviar logs de auth para o Sentry
function shouldLogAuthToSentry(message: string): boolean {
  const authEvents = [
    'signed in',
    'signed out',
    'sign in error',
    'sign up error',
    'token refresh'
  ]
  
  return authEvents.some(event => 
    message.toLowerCase().includes(event.toLowerCase())
  )
}
