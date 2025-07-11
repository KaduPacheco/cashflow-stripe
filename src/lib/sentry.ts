import * as Sentry from '@sentry/react'
import { SecureLogger } from './logger'

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN
const ENVIRONMENT = import.meta.env.MODE

// Configuração do Sentry apenas em produção
export const initSentry = () => {
  if (ENVIRONMENT === 'production' && SENTRY_DSN) {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: ENVIRONMENT,
      
      // Configurações de privacidade e performance
      tracesSampleRate: 0.1, // 10% das transações para performance
      beforeSend(event: Sentry.Event, hint: Sentry.EventHint): Sentry.Event | null {
        // Sanitizar dados sensíveis antes de enviar
        return sanitizeEvent(event)
      },
      
      // Configurar release para versionamento
      release: `cash-flow@${import.meta.env.VITE_APP_VERSION || '1.0.0'}`,
      
      // Filtros de URL para ignorar routes irrelevantes
      ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured',
        'Network request failed',
      ],
      
      // Configurações adicionais de privacidade
      beforeBreadcrumb(breadcrumb: Sentry.Breadcrumb): Sentry.Breadcrumb | null {
        // Filtrar breadcrumbs sensíveis
        if (breadcrumb.category === 'console') {
          return null
        }
        return breadcrumb
      }
    })
    
    SecureLogger.info('Sentry initialized successfully', { environment: ENVIRONMENT })
  } else if (ENVIRONMENT === 'development') {
    SecureLogger.debug('Sentry disabled in development mode')
  } else {
    SecureLogger.warn('Sentry not configured - missing VITE_SENTRY_DSN')
  }
}

// Sanitizar evento antes de enviar ao Sentry
function sanitizeEvent(event: Sentry.Event): Sentry.Event | null {
  // Remover dados sensíveis das tags e contexto
  if (event.tags) {
    delete event.tags.email
    delete event.tags.phone
    delete event.tags.document
  }
  
  // Sanitizar contexto do usuário
  if (event.user) {
    event.user = {
      id: event.user.id, // Manter apenas o ID
    }
  }
  
  // Sanitizar request data
  if (event.request?.data) {
    event.request.data = '[Filtered]'
  }
  
  // Filtrar exceptions que possam conter dados sensíveis
  if (event.exception?.values) {
    event.exception.values.forEach(exception => {
      if (exception.value && containsSensitiveData(exception.value)) {
        exception.value = 'Sensitive data filtered'
      }
    })
  }
  
  return event
}

// Verificar se a mensagem contém dados sensíveis
function containsSensitiveData(message: string): boolean {
  const sensitivePatterns = [
    /password/i,
    /token/i,
    /secret/i,
    /auth/i,
    /email/i,
    /cpf/i,
    /cnpj/i,
    /phone/i,
    /whatsapp/i
  ]
  
  return sensitivePatterns.some(pattern => pattern.test(message))
}

// Funções utilitárias para logging seguro
export const SentryLogger = {
  // Capturar erro com contexto sanitizado
  captureError: (error: Error, context?: Record<string, any>) => {
    if (ENVIRONMENT === 'production') {
      Sentry.withScope(scope => {
        if (context) {
          // Sanitizar contexto antes de adicionar
          const sanitizedContext = sanitizeContext(context)
          Object.entries(sanitizedContext).forEach(([key, value]) => {
            scope.setTag(key, value)
          })
        }
        Sentry.captureException(error)
      })
    }
    
    // Sempre logar localmente (com mascaramento)
    SecureLogger.error('Error captured', { error: error.message, context })
  },
  
  // Capturar evento personalizado
  captureEvent: (message: string, level: 'info' | 'warning' | 'error', extra?: Record<string, any>) => {
    if (ENVIRONMENT === 'production') {
      Sentry.addBreadcrumb({
        message,
        level,
        data: extra ? sanitizeContext(extra) : undefined,
        timestamp: Date.now() / 1000,
      })
    }
    
    SecureLogger[level === 'warning' ? 'warn' : level](message, extra)
  },
  
  // Configurar contexto do usuário (sanitizado)
  setUser: (userId: string) => {
    if (ENVIRONMENT === 'production') {
      Sentry.setUser({ id: userId })
    }
  },
  
  // Remover contexto do usuário
  clearUser: () => {
    if (ENVIRONMENT === 'production') {
      Sentry.setUser(null)
    }
  }
}

// Sanitizar contexto removendo dados sensíveis
function sanitizeContext(context: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {}
  
  Object.entries(context).forEach(([key, value]) => {
    if (containsSensitiveData(key.toLowerCase())) {
      sanitized[key] = '[Filtered]'
    } else if (typeof value === 'string' && containsSensitiveData(value)) {
      sanitized[key] = '[Filtered]'
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = '[Object]'
    } else {
      sanitized[key] = value
    }
  })
  
  return sanitized
}
