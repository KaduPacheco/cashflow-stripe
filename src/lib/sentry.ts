
import * as Sentry from '@sentry/react'
import { env, features } from './env'

// Configuração do Sentry apenas se DSN estiver disponível
export function initSentry(): void {
  if (!features.sentry) {
    console.log('⚠️ Sentry não configurado - DSN não encontrado')
    return
  }

  Sentry.init({
    dsn: env.VITE_SENTRY_DSN,
    environment: env.MODE,
    beforeSend(event, hint) {
      // Filtrar eventos sensíveis ou desnecessários
      if (event.exception) {
        const error = hint.originalException
        
        // Não enviar erros de desenvolvimento
        if (env.MODE === 'development' && error instanceof Error) {
          console.warn('🐛 Erro interceptado (dev):', error.message)
          return null
        }
        
        // Filtrar erros conhecidos e não críticos
        if (error instanceof Error) {
          const ignoredMessages = [
            'ResizeObserver loop limit exceeded',
            'Non-Error promise rejection captured',
            'Network request failed',
          ]
          
          if (ignoredMessages.some(msg => error.message.includes(msg))) {
            return null
          }
        }
      }
      
      return event
    },
    tracesSampleRate: env.MODE === 'production' ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  })

  console.log('✅ Sentry inicializado')
}

// Logger seguro para captura de eventos
export const SentryLogger = {
  captureEvent: (message: string, level: 'info' | 'warning' | 'error' = 'info', extra?: Record<string, any>) => {
    if (!features.sentry) return
    
    Sentry.addBreadcrumb({
      message,
      level,
      data: extra,
      timestamp: Date.now() / 1000,
    })
  },
  
  captureError: (error: Error, context?: Record<string, any>) => {
    if (!features.sentry) {
      console.error('Erro capturado:', error, context)
      return
    }
    
    Sentry.withScope((scope) => {
      if (context) {
        Object.keys(context).forEach(key => {
          scope.setTag(key, context[key])
        })
      }
      Sentry.captureException(error)
    })
  },
  
  setUser: (userId: string) => {
    if (!features.sentry) return
    
    Sentry.setUser({ id: userId })
  },
  
  clearUser: () => {
    if (!features.sentry) return
    
    Sentry.setUser(null)
  },
}

// Handler para erros não capturados
export function setupGlobalErrorHandling(): void {
  // Capturar erros não tratados
  window.addEventListener('error', (event) => {
    SentryLogger.captureError(
      new Error(event.message),
      {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      }
    )
  })

  // Capturar promises rejeitadas
  window.addEventListener('unhandledrejection', (event) => {
    SentryLogger.captureError(
      new Error(`Promise rejeitada: ${event.reason}`),
      { type: 'unhandled_promise_rejection' }
    )
  })
}
