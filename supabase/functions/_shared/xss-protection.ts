
// XSS Protection utilities for Edge Functions
import sanitizeHtml from 'https://esm.sh/sanitize-html@2.11.0'

export interface SanitizationOptions {
  allowedTags?: string[]
  allowedAttributes?: Record<string, string[]>
  removeEmpty?: boolean
}

// Configuração segura padrão - remove todos os tags HTML
const DEFAULT_SANITIZE_OPTIONS: SanitizationOptions = {
  allowedTags: [], // Nenhum tag HTML permitido
  allowedAttributes: {},
  removeEmpty: true
}

// Configuração para textos que podem ter formatação básica (se necessário)
const BASIC_FORMAT_OPTIONS: SanitizationOptions = {
  allowedTags: ['b', 'i', 'strong', 'em'],
  allowedAttributes: {},
  removeEmpty: true
}

export class XSSProtection {
  /**
   * Sanitiza texto removendo completamente qualquer HTML
   */
  static sanitizeText(input: unknown): string {
    if (typeof input !== 'string') {
      return ''
    }

    // Remove caracteres de controle
    let cleaned = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    
    // Sanitiza HTML completamente
    cleaned = sanitizeHtml(cleaned, DEFAULT_SANITIZE_OPTIONS)
    
    // Remove scripts inline e event handlers
    cleaned = cleaned
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/data:(?!image\/(png|jpg|jpeg|gif|svg|webp);base64,)/gi, '')
    
    // Limita tamanho
    return cleaned.trim().slice(0, 10000)
  }

  /**
   * Sanitiza texto permitindo formatação básica (se necessário)
   */
  static sanitizeWithBasicFormat(input: unknown): string {
    if (typeof input !== 'string') {
      return ''
    }

    let cleaned = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    cleaned = sanitizeHtml(cleaned, BASIC_FORMAT_OPTIONS)
    
    return cleaned.trim().slice(0, 10000)
  }

  /**
   * Valida se o input contém tentativas de XSS
   */
  static containsXSS(input: string): boolean {
    const xssPatterns = [
      /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
      /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<img[^>]+onerror[^>]*>/gi,
      /<svg[^>]*onload[^>]*>/gi,
      /data:text\/html/gi,
      /vbscript:/gi
    ]

    return xssPatterns.some(pattern => pattern.test(input))
  }

  /**
   * Sanitiza objeto recursivamente
   */
  static sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeText(value)
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        sanitized[key] = this.sanitizeObject(value as Record<string, unknown>)
      } else {
        sanitized[key] = value
      }
    }

    return sanitized
  }

  /**
   * Middleware para sanitizar body da requisição
   */
  static sanitizeRequestBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body
    }

    return this.sanitizeObject(body)
  }
}

/**
 * Valida campos específicos do sistema
 */
export class FieldValidator {
  // Campos de transação
  static validateTransactionFields(data: any): any {
    return {
      ...data,
      estabelecimento: XSSProtection.sanitizeText(data.estabelecimento),
      detalhes: XSSProtection.sanitizeText(data.detalhes),
    }
  }

  // Campos de categoria
  static validateCategoryFields(data: any): any {
    return {
      ...data,
      nome: XSSProtection.sanitizeText(data.nome),
      tags: XSSProtection.sanitizeText(data.tags),
    }
  }

  // Campos de perfil
  static validateProfileFields(data: any): any {
    return {
      ...data,
      nome: XSSProtection.sanitizeText(data.nome),
      username: XSSProtection.sanitizeText(data.username),
    }
  }

  // Campos de lembretes
  static validateReminderFields(data: any): any {
    return {
      ...data,
      descricao: XSSProtection.sanitizeText(data.descricao),
    }
  }

  // Campos de contas a pagar/receber
  static validateAccountFields(data: any): any {
    return {
      ...data,
      descricao: XSSProtection.sanitizeText(data.descricao),
      observacoes: XSSProtection.sanitizeText(data.observacoes),
      numero_documento: XSSProtection.sanitizeText(data.numero_documento),
    }
  }

  // Campos de clientes/fornecedores
  static validateContactFields(data: any): any {
    return {
      ...data,
      nome: XSSProtection.sanitizeText(data.nome),
      documento: XSSProtection.sanitizeText(data.documento),
      endereco: XSSProtection.sanitizeText(data.endereco),
      observacoes: XSSProtection.sanitizeText(data.observacoes),
    }
  }
}
