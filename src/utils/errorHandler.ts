
import { toast } from 'sonner'
import { SecurityError } from '@/lib/security'

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

  if (error instanceof SecurityError) {
    appError = createAppError(error.message, error.code, error.statusCode)
    
    if (showToast) {
      toast.error('Erro de Segurança', {
        description: error.message,
      })
    }
  } else if (error instanceof ValidationError) {
    appError = createAppError(error.message, error.code, 400, { field: error.field })
    
    if (showToast) {
      toast.error('Erro de Validação', {
        description: error.message,
      })
    }
  } else if (error instanceof NetworkError) {
    appError = createAppError(error.message, error.code, error.statusCode)
    
    if (showToast) {
      toast.error('Erro de Conexão', {
        description: error.message,
      })
    }
  } else if (error instanceof Error) {
    appError = createAppError(error.message, 'UNKNOWN_ERROR', 500)
    
    if (showToast) {
      toast.error('Erro Inesperado', {
        description: 'Algo deu errado. Tente novamente.',
      })
    }
  } else {
    appError = createAppError('Erro desconhecido', 'UNKNOWN_ERROR', 500)
    
    if (showToast) {
      toast.error('Erro Inesperado', {
        description: 'Algo deu errado. Tente novamente.',
      })
    }
  }

  // Log error for monitoring
  logError(appError)

  return appError
}

function logError(error: AppError): void {
  // In production, send to monitoring service
  console.error('App Error:', {
    message: error.message,
    code: error.code,
    statusCode: error.statusCode,
    timestamp: error.timestamp,
    context: error.context,
    stack: new Error().stack
  })
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
