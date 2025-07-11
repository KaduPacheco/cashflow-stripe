
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
  }
}
