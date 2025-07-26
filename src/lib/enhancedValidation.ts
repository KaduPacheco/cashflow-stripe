
import { z } from 'zod'
import { XSSSecurityClient } from './xssSecurity'

// Enhanced validation schemas with security considerations
export const EnhancedValidationSchemas = {
  // Financial validation with strict rules
  currency: z.number()
    .min(0.01, 'Valor deve ser maior que zero')
    .max(999999999.99, 'Valor muito alto')
    .refine(
      (val) => Number.isFinite(val) && val > 0,
      'Valor deve ser um número válido e positivo'
    ),

  // Secure text input with XSS protection
  secureText: z.string()
    .min(1, 'Campo obrigatório')
    .max(1000, 'Texto muito longo')
    .transform((val) => XSSSecurityClient.sanitizeText(val))
    .refine(
      (val) => val.length > 0,
      'Campo não pode estar vazio após sanitização'
    ),

  // Enhanced description validation
  description: z.string()
    .min(3, 'Descrição deve ter pelo menos 3 caracteres')
    .max(500, 'Descrição muito longa')
    .transform((val) => XSSSecurityClient.sanitizeText(val))
    .refine(
      (val) => !/^\s*$/.test(val),
      'Descrição não pode conter apenas espaços'
    ),

  // Secure email validation
  email: z.string()
    .email('Email inválido')
    .max(254, 'Email muito longo')
    .transform((val) => val.toLowerCase().trim())
    .refine(
      (val) => !val.includes('..'),
      'Email não pode conter pontos consecutivos'
    ),

  // Enhanced phone validation
  phone: z.string()
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Formato de telefone inválido')
    .min(10, 'Telefone deve ter pelo menos 10 dígitos')
    .max(20, 'Telefone muito longo')
    .transform((val) => val.replace(/\D/g, '')),

  // Date validation with business rules
  businessDate: z.string()
    .refine(
      (val) => !isNaN(Date.parse(val)),
      'Data inválida'
    )
    .refine(
      (val) => {
        const date = new Date(val)
        const now = new Date()
        const maxFutureDate = new Date(now.getFullYear() + 5, now.getMonth(), now.getDate())
        const minPastDate = new Date(2000, 0, 1)
        return date >= minPastDate && date <= maxFutureDate
      },
      'Data deve estar entre 2000 e 5 anos no futuro'
    ),

  // UUID validation
  uuid: z.string()
    .uuid('ID inválido')
    .refine(
      (val) => val.length === 36,
      'Formato de ID inválido'
    ),

  // Enhanced password validation
  password: z.string()
    .min(12, 'Senha deve ter pelo menos 12 caracteres')
    .max(128, 'Senha muito longa')
    .refine(
      (val) => /[A-Z]/.test(val),
      'Senha deve conter pelo menos uma letra maiúscula'
    )
    .refine(
      (val) => /[a-z]/.test(val),
      'Senha deve conter pelo menos uma letra minúscula'
    )
    .refine(
      (val) => /\d/.test(val),
      'Senha deve conter pelo menos um número'
    )
    .refine(
      (val) => /[!@#$%^&*(),.?":{}|<>]/.test(val),
      'Senha deve conter pelo menos um caractere especial'
    )
    .refine(
      (val) => !/(.)\1{2,}/.test(val),
      'Senha não deve ter mais de 2 caracteres repetidos consecutivos'
    )
}

// Transaction validation schema
export const TransactionValidationSchema = z.object({
  valor: EnhancedValidationSchemas.currency,
  descricao: EnhancedValidationSchemas.description,
  estabelecimento: EnhancedValidationSchemas.secureText,
  detalhes: z.string()
    .max(1000, 'Detalhes muito longos')
    .transform((val) => XSSSecurityClient.sanitizeText(val))
    .optional(),
  quando: EnhancedValidationSchemas.businessDate,
  tipo: z.enum(['receita', 'despesa'], {
    errorMap: () => ({ message: 'Tipo deve ser receita ou despesa' })
  }),
  category_id: EnhancedValidationSchemas.uuid
})

// Account validation schema
export const AccountValidationSchema = z.object({
  descricao: EnhancedValidationSchemas.description,
  valor: EnhancedValidationSchemas.currency,
  data_vencimento: EnhancedValidationSchemas.businessDate,
  tipo: z.enum(['pagar', 'receber'], {
    errorMap: () => ({ message: 'Tipo deve ser pagar ou receber' })
  }),
  category_id: EnhancedValidationSchemas.uuid.optional(),
  observacoes: z.string()
    .max(1000, 'Observações muito longas')
    .transform((val) => XSSSecurityClient.sanitizeText(val))
    .optional()
})

// User profile validation schema
export const UserProfileValidationSchema = z.object({
  nome: EnhancedValidationSchemas.secureText,
  email: EnhancedValidationSchemas.email,
  phone: EnhancedValidationSchemas.phone.optional(),
  whatsapp: EnhancedValidationSchemas.phone.optional()
})

// Category validation schema
export const CategoryValidationSchema = z.object({
  nome: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome muito longo')
    .transform((val) => XSSSecurityClient.sanitizeText(val)),
  tags: z.string()
    .max(200, 'Tags muito longas')
    .transform((val) => XSSSecurityClient.sanitizeText(val))
    .optional()
})

// Validation utility functions
export const ValidationUtils = {
  validateAndSanitize: <T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } => {
    try {
      const result = schema.safeParse(data)
      if (result.success) {
        return { success: true, data: result.data }
      } else {
        const errors = result.error.errors.map(err => err.message)
        return { success: false, errors }
      }
    } catch (error) {
      return { success: false, errors: ['Erro de validação interno'] }
    }
  },

  sanitizeFormData: (data: Record<string, any>): Record<string, any> => {
    return XSSSecurityClient.sanitizeObject(data)
  },

  validateFinancialAmount: (amount: number): { valid: boolean; error?: string } => {
    if (!Number.isFinite(amount)) {
      return { valid: false, error: 'Valor deve ser um número válido' }
    }
    if (amount <= 0) {
      return { valid: false, error: 'Valor deve ser positivo' }
    }
    if (amount > 999999999.99) {
      return { valid: false, error: 'Valor muito alto' }
    }
    return { valid: true }
  }
}
