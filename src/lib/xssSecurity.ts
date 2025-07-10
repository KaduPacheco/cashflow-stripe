import DOMPurify from 'dompurify'

export class XSSSecurityClient {
  /**
   * Sanitiza texto no frontend usando DOMPurify
   */
  static sanitizeText(input: string): string {
    if (!input || typeof input !== 'string') {
      return ''
    }

    // Configuração restritiva - remove todos os tags HTML
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
   * Valida se o input é seguro (não contém tentativas de XSS)
   */
  static isSafe(input: string): boolean {
    const original = input
    const sanitized = this.sanitizeText(input)
    
    // Se a sanitização mudou o conteúdo, pode conter XSS
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
        sanitized[key] = this.sanitizeText(value)
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        sanitized[key] = this.sanitizeObject(value)
      }
    }

    return sanitized
  }
}

/**
 * Hook para sanitização automática de valores de formulário
 */
export function useSafeValue(value: string): string {
  return XSSSecurityClient.sanitizeText(value)
}

/**
 * Componente wrapper para renderização segura de texto
 */
export interface SafeTextProps {
  children: string
  allowBasicHTML?: boolean
  className?: string
}

export function SafeText({ children, allowBasicHTML = false, className }: SafeTextProps) {
  const safeContent = allowBasicHTML 
    ? XSSSecurityClient.sanitizeHTML(children)
    : XSSSecurityClient.sanitizeText(children)

  if (allowBasicHTML) {
    return (
      <span 
        className={className}
        dangerouslySetInnerHTML={{ __html: safeContent }} 
      />
    )
  }

  return <span className={className}>{safeContent}</span>
}