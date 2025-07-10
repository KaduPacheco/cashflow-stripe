import DOMPurify from 'dompurify'

export class XSSSecurityClient {
  /**
   * Sanitiza texto no frontend usando DOMPurify
   */
  static sanitizeText(input: string): string {
    if (!input || typeof input !== 'string') {
      return ''
    }

    const clean = DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
      USE_PROFILES: { html: false }
    })

    return clean.trim()
  }

  /**
   * Sanitiza conteúdo HTML permitindo apenas formatação básica
   */
  static sanitizeHTML(input: string): string {
    if (!input || typeof input !== 'string') {
      return ''
    }

    const clean = DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['b', 'i', 'strong', 'em', 'br'],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true
    })

    return clean.trim()
  }

  /**
   * Valida se o input é seguro
   */
  static isSafe(input: string): boolean {
    const original = input
    const sanitized = this.sanitizeText(input)
    return original === sanitized
  }

  /**
   * Sanitiza objeto recursivamente
   */
  static sanitizeObject<T extends Record<string, any>>(obj: T): T {
    const sanitized = { ...obj }

    for (const key in sanitized) {
      const value = sanitized[key]
      
      if (typeof value === 'string') {
        (sanitized as any)[key] = this.sanitizeText(value)
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        (sanitized as any)[key] = this.sanitizeObject(value)
      }
    }

    return sanitized
  }
}

export function useSafeValue(value: string): string {
  return XSSSecurityClient.sanitizeText(value)
}