import { toast } from 'sonner'
import { SecurityError } from '@/lib/security'
import { SentryLogger, ErrorInterceptor, ErrorCategory } from '@/lib/errorInterceptor'

export interface AppError {
  message: string
  code: string
  statusCode: number
  timestamp: Date
  context?: Record<string, unknown>
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public code: string = 'VALIDATION_ERROR'
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class NetworkError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string = 'NETWORK_ERROR'
  ) {
    super(message)
    this.name = 'NetworkError'
  }
}

export function createAppError(
  message: string,
  code: string,
  statusCode: number = 500,
  context?: Record<string, unknown>
): AppError {
  return {
    message,
    code,
    statusCode,
    timestamp: new Date(),
    context
  }
}

export function handleError(error: unknown, showToast: boolean = true): AppError {
  console.error('Error caught:', error)

  let appError: AppError

  // Converter para Error se necessário
  const errorInstance = error instanceof Error 
    ? error 
    : new Error(typeof error === 'string' ? error : 'Unknown error')

  // Usar o interceptador para estruturar o erro
  const structuredError = ErrorInterceptor.handle(errorInstance, { showToast })

  if (error instanceof SecurityError) {
    appError = createAppError(error.message, error.code, error.statusCode)
    
    // Log de segurança no Sentry
    SentryLogger.captureEvent(
      `Security violation: ${error.code}`, 
      'error', 
      { securityCode: error.code }
    )
    
    if (showToast) {
      toast.error('Erro de Segurança', {
        description: structuredError.userMessage,
      })
    }
  } else if (error instanceof ValidationError) {
    appError = createAppError(error.message, error.code, 400, { field: error.field })
    
    if (showToast) {
      toast.error('Erro de Validação', {
        description: structuredError.userMessage,
      })
    }
  } else if (error instanceof NetworkError) {
    appError = createAppError(error.message, error.code, error.statusCode)
    
    if (showToast) {
      toast.error('Erro de Conexão', {
        description: structuredError.userMessage,
      })
    }
  } else if (error instanceof Error) {
    appError = createAppError(error.message, 'UNKNOWN_ERROR', 500)
    
    if (showToast && structuredError.shouldShowToUser) {
      toast.error('Erro Inesperado', {
        description: structuredError.userMessage,
      })
    }
  } else {
    appError = createAppError('Erro desconhecido', 'UNKNOWN_ERROR', 500)
    
    if (showToast) {
      toast.error('Erro Inesperado', {
        description: 'Algo deu errado. Nossa equipe foi notificada.',
      })
    }
  }

  // Log error for monitoring
  logError(appError)

  return appError
}

function logError(error: AppError): void {
  // Log seguro (dados sensíveis já foram filtrados)
  SentryLogger.captureEvent(
    `App Error: ${error.code}`,
    'error',
    {
      code: error.code,
      statusCode: error.statusCode,
      timestamp: error.timestamp,
      context: error.context
    }
  )
}

export function isRetryableError(error: AppError): boolean {
  // Network errors and rate limits are retryable
  return error.code === 'NETWORK_ERROR' || 
         error.code === 'RATE_LIMIT_EXCEEDED' ||
         error.statusCode >= 500
}

export function getRetryDelay(attemptNumber: number): number {
  // Exponential backoff with jitter
  const baseDelay = Math.pow(2, attemptNumber) * 1000 // 1s, 2s, 4s, 8s...
  const jitter = Math.random() * 0.1 * baseDelay
  return Math.min(baseDelay + jitter, 30000) // Max 30 seconds
}
