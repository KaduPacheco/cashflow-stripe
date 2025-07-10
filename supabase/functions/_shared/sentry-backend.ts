
// Configuração do Sentry para Edge Functions
const SENTRY_DSN = Deno.env.get('SENTRY_DSN')
const ENVIRONMENT = Deno.env.get('ENVIRONMENT') || 'development'

interface SentryEvent {
  message: string
  level: 'info' | 'warning' | 'error'
  extra?: Record<string, any>
  user?: { id: string }
  timestamp: number
}

export class BackendSentryLogger {
  static async captureError(error: Error, context?: Record<string, any>, userId?: string) {
    if (ENVIRONMENT !== 'production' || !SENTRY_DSN) {
      console.error('Backend Error:', error.message, context)
      return
    }

    const event: SentryEvent = {
      message: error.message,
      level: 'error',
      extra: this.sanitizeContext(context),
      user: userId ? { id: userId } : undefined,
      timestamp: Date.now() / 1000
    }

    try {
      await this.sendToSentry(event)
    } catch (sentryError) {
      console.error('Failed to send error to Sentry:', sentryError)
    }
  }

  static async captureEvent(message: string, level: 'info' | 'warning' | 'error', extra?: Record<string, any>, userId?: string) {
    if (ENVIRONMENT !== 'production' || !SENTRY_DSN) {
      console.log(`[${level.toUpperCase()}] ${message}`, extra)
      return
    }

    const event: SentryEvent = {
      message,
      level,
      extra: this.sanitizeContext(extra),
      user: userId ? { id: userId } : undefined,
      timestamp: Date.now() / 1000
    }

    try {
      await this.sendToSentry(event)
    } catch (sentryError) {
      console.error('Failed to send event to Sentry:', sentryError)
    }
  }

  private static sanitizeContext(context?: Record<string, any>): Record<string, any> | undefined {
    if (!context) return undefined

    const sanitized: Record<string, any> = {}
    const sensitiveKeys = ['password', 'token', 'secret', 'auth', 'email', 'phone', 'document']

    Object.entries(context).forEach(([key, value]) => {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[Filtered]'
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = '[Object]'
      } else {
        sanitized[key] = value
      }
    })

    return sanitized
  }

  private static async sendToSentry(event: SentryEvent) {
    if (!SENTRY_DSN) return

    // Implementação simplificada para Edge Functions
    const sentryUrl = SENTRY_DSN.replace('/api/', '/api/store/')
    
    const payload = {
      event_id: crypto.randomUUID(),
      timestamp: event.timestamp,
      platform: 'javascript',
      sdk: {
        name: 'custom-edge-function',
        version: '1.0.0'
      },
      environment: ENVIRONMENT,
      level: event.level,
      message: {
        message: event.message
      },
      extra: event.extra,
      user: event.user
    }

    await fetch(sentryUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })
  }
}
