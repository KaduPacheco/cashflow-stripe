
import { SentryLogger } from './sentry'
import { toast } from '@/hooks/use-toast'

// Tipos de erro para categorização
export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NETWORK = 'network',
  VALIDATION = 'validation',
  TRANSACTION = 'transaction',
  SUBSCRIPTION = 'subscription',
  UNKNOWN = 'unknown'
}

// Interface para erro estruturado
export interface StructuredError {
  category: ErrorCategory
  message: string
  originalError: Error
  context?: Record<string, any>
  shouldShowToUser: boolean
  userMessage: string
}

// Mapeamento de erros para categorias
function categorizeError(error: Error): ErrorCategory {
  const message = error.message.toLowerCase()
  
  if (message.includes('auth') || message.includes('login') || message.includes('token')) {
    return ErrorCategory.AUTHENTICATION
  }
  if (message.includes('permission') || message.includes('unauthorized') || message.includes('forbidden')) {
    return ErrorCategory.AUTHORIZATION
  }
  if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
    return ErrorCategory.NETWORK
  }
  if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
    return ErrorCategory.VALIDATION
  }
  if (message.includes('transação') || message.includes('transaction')) {
    return ErrorCategory.TRANSACTION
  }
  if (message.includes('subscription') || message.includes('assinatura') || message.includes('plano')) {
    return ErrorCategory.SUBSCRIPTION
  }
  
  return ErrorCategory.UNKNOWN
}

// Mensagens amigáveis para o usuário
const USER_FRIENDLY_MESSAGES: Record<ErrorCategory, string> = {
  [ErrorCategory.AUTHENTICATION]: 'Erro de autenticação. Por favor, faça login novamente.',
  [ErrorCategory.AUTHORIZATION]: 'Você não tem permissão para esta operação.',
  [ErrorCategory.NETWORK]: 'Erro de conexão. Verifique sua internet e tente novamente.',
  [ErrorCategory.VALIDATION]: 'Dados inválidos. Verifique as informações inseridas.',
  [ErrorCategory.TRANSACTION]: 'Erro ao processar transação. Tente novamente.',
  [ErrorCategory.SUBSCRIPTION]: 'Erro relacionado à assinatura. Entre em contato com o suporte.',
  [ErrorCategory.UNKNOWN]: 'Algo deu errado. Nossa equipe foi notificada.'
}

// Interceptador global de erros
export class ErrorInterceptor {
  static handle(error: Error, context?: Record<string, any>): StructuredError {
    const category = categorizeError(error)
    const shouldShowToUser = this.shouldShowErrorToUser(category, error)
    const userMessage = this.getUserMessage(category, error)
    
    const structuredError: StructuredError = {
      category,
      message: error.message,
      originalError: error,
      context,
      shouldShowToUser,
      userMessage
    }
    
    // Capturar no Sentry com contexto
    SentryLogger.captureError(error, {
      category,
      ...context
    })
    
    // Mostrar toast se apropriado
    if (shouldShowToUser) {
      toast({
        title: 'Ops! Algo deu errado',
        description: userMessage,
        variant: 'destructive',
      })
    }
    
    return structuredError
  }
  
  private static shouldShowErrorToUser(category: ErrorCategory, error: Error): boolean {
    // Não mostrar erros técnicos ou de sistema
    const technicalErrors = [
      'chunk load error',
      'loading css chunk',
      'loading chunk',
      'script error'
    ]
    
    const message = error.message.toLowerCase()
    return !technicalErrors.some(technical => message.includes(technical))
  }
  
  private static getUserMessage(category: ErrorCategory, error: Error): string {
    // Para alguns erros específicos, usar a mensagem original se for amigável
    const friendlyErrorPatterns = [
      /email já está em uso/i,
      /senha deve ter pelo menos/i,
      /campo obrigatório/i
    ]
    
    const message = error.message
    if (friendlyErrorPatterns.some(pattern => pattern.test(message))) {
      return message
    }
    
    return USER_FRIENDLY_MESSAGES[category]
  }
}

// Hook para window error handler
export const setupGlobalErrorHandling = () => {
  // Capturar erros JavaScript não tratados
  window.addEventListener('error', (event) => {
    ErrorInterceptor.handle(new Error(event.message), {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    })
  })
  
  // Capturar promises rejeitadas não tratadas
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(String(event.reason))
    
    ErrorInterceptor.handle(error, {
      type: 'unhandled_promise_rejection'
    })
  })
}
