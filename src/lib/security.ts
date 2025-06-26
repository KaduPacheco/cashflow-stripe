
import { User, Session } from '@supabase/supabase-js'

// Rate limiting store (in-memory for simple implementation)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export class SecurityError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message)
    this.name = 'SecurityError'
  }
}

export const SecurityConfig = {
  MAX_REQUESTS_PER_MINUTE: 60,
  MAX_REQUESTS_PER_HOUR: 1000,
  SESSION_TIMEOUT_MINUTES: 60,
  MAX_STRING_LENGTH: 10000,
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_FILE_SIZE: 5 * 1024 * 1024 // 5MB
} as const

export function validateAuthentication(user: User | null, session: Session | null): void {
  if (!user || !session) {
    throw new SecurityError('Usuário não autenticado', 'AUTH_REQUIRED', 401)
  }

  // Check session expiration
  const now = Math.floor(Date.now() / 1000)
  if (session.expires_at && session.expires_at < now) {
    throw new SecurityError('Sessão expirada', 'SESSION_EXPIRED', 401)
  }
}

export function validateResourceOwnership(
  resourceUserId: string,
  currentUserId: string
): void {
  if (resourceUserId !== currentUserId) {
    throw new SecurityError(
      'Acesso negado: recurso não pertence ao usuário',
      'RESOURCE_ACCESS_DENIED',
      403
    )
  }
}

export function validateRateLimit(identifier: string, maxRequests = SecurityConfig.MAX_REQUESTS_PER_MINUTE): void {
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute
  
  const record = rateLimitStore.get(identifier)
  
  if (!record || now > record.resetTime) {
    // Reset or create new record
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    })
    return
  }
  
  if (record.count >= maxRequests) {
    throw new SecurityError(
      'Muitas tentativas. Tente novamente em alguns minutos.',
      'RATE_LIMIT_EXCEEDED',
      429
    )
  }
  
  record.count += 1
}

export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }
  
  // Remove potential harmful characters
  return input
    .slice(0, SecurityConfig.MAX_STRING_LENGTH)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
}

export function validateFileUpload(file: File): void {
  if (!SecurityConfig.ALLOWED_FILE_TYPES.includes(file.type)) {
    throw new SecurityError(
      'Tipo de arquivo não permitido',
      'INVALID_FILE_TYPE',
      400
    )
  }
  
  if (file.size > SecurityConfig.MAX_FILE_SIZE) {
    throw new SecurityError(
      'Arquivo muito grande. Máximo 5MB.',
      'FILE_TOO_LARGE',
      400
    )
  }
}

export function createSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
  }
}

// Cleanup old rate limit records
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000) // Clean every 5 minutes
