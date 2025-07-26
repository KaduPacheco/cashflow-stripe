
import DOMPurify from 'dompurify'

export class XSSSecurityClient {
  private static isInitialized = false
  private static initError: string | null = null

  /**
   * Initialize DOMPurify safely
   */
  private static initialize(): boolean {
    if (this.isInitialized) return this.initError === null

    try {
      if (typeof window === 'undefined') {
        this.initError = 'DOMPurify requires browser environment'
        return false
      }

      // Test DOMPurify functionality
      const testResult = DOMPurify.sanitize('<script>alert("test")</script>')
      if (testResult === '') {
        this.isInitialized = true
        return true
      } else {
        this.initError = 'DOMPurify test failed'
        return false
      }
    } catch (error) {
      this.initError = `DOMPurify initialization failed: ${error}`
      return false
    }
  }

  /**
   * Fallback sanitization when DOMPurify fails
   */
  private static fallbackSanitize(input: string): string {
    if (!input || typeof input !== 'string') {
      return ''
    }

    // Basic HTML entity encoding
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .trim()
  }

  /**
   * Sanitiza texto no frontend usando DOMPurify com fallback
   */
  static sanitizeText(input: string): string {
    if (!input || typeof input !== 'string') {
      return ''
    }

    if (this.initialize()) {
      try {
        const clean = DOMPurify.sanitize(input, {
          ALLOWED_TAGS: [],
          ALLOWED_ATTR: [],
          KEEP_CONTENT: true,
          USE_PROFILES: { html: false }
        })
        return clean.trim()
      } catch (error) {
        console.error('DOMPurify sanitization failed, using fallback:', error)
        return this.fallbackSanitize(input)
      }
    }

    console.warn('DOMPurify not available, using fallback sanitization')
    return this.fallbackSanitize(input)
  }

  /**
   * Sanitiza conteúdo HTML permitindo apenas formatação básica
   */
  static sanitizeHTML(input: string): string {
    if (!input || typeof input !== 'string') {
      return ''
    }

    if (this.initialize()) {
      try {
        const clean = DOMPurify.sanitize(input, {
          ALLOWED_TAGS: ['b', 'i', 'strong', 'em', 'br'],
          ALLOWED_ATTR: [],
          KEEP_CONTENT: true
        })
        return clean.trim()
      } catch (error) {
        console.error('DOMPurify HTML sanitization failed, using fallback:', error)
        return this.fallbackSanitize(input)
      }
    }

    return this.fallbackSanitize(input)
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

  /**
   * Get initialization status for monitoring
   */
  static getStatus(): { initialized: boolean; error: string | null } {
    this.initialize()
    return {
      initialized: this.isInitialized,
      error: this.initError
    }
  }
}

export function useSafeValue(value: string): string {
  return XSSSecurityClient.sanitizeText(value)
}
