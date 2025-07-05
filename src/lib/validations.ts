
import { z } from 'zod'

// Enhanced Transaction validations
export const TransactionSchema = z.object({
  estabelecimento: z.string()
    .min(1, 'Estabelecimento é obrigatório')
    .max(255, 'Estabelecimento muito longo')
    .trim(),
  valor: z.number()
    .positive('Valor deve ser positivo')
    .max(1000000, 'Valor máximo excedido')
    .refine(val => !isNaN(val), 'Valor deve ser um número válido'),
  tipo: z.enum(['receita', 'despesa'], {
    errorMap: () => ({ message: 'Tipo deve ser receita ou despesa' })
  }),
  category_id: z.string()
    .uuid('ID da categoria inválido')
    .min(1, 'Categoria é obrigatória'),
  detalhes: z.string()
    .max(500, 'Detalhes muito longos')
    .optional()
    .transform(val => val?.trim()),
  quando: z.string()
    .min(1, 'Data é obrigatória')
    .refine(val => !isNaN(Date.parse(val)), 'Data inválida')
})

export const TransactionUpdateSchema = TransactionSchema.partial()

// Enhanced Category validations
export const CategorySchema = z.object({
  nome: z.string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome muito longo')
    .trim(),
  cor: z.string()
    .regex(/^#[0-9A-F]{6}$/i, 'Cor deve estar no formato hexadecimal')
    .default('#3B82F6'),
  icone: z.string()
    .max(50, 'Nome do ícone muito longo')
    .optional()
})

// Form validation schemas
export const RecurringTransactionSchema = z.object({
  recorrente: z.boolean().default(false),
  recorrencia: z.enum(['mensal', 'trimestral', 'semestral', 'anual']).default('mensal'),
  parcelado: z.boolean().default(false),
  numeroParcelas: z.number()
    .int('Número de parcelas deve ser inteiro')
    .min(2, 'Mínimo 2 parcelas')
    .max(60, 'Máximo 60 parcelas')
    .default(2)
})

// Subscription validations
export const SubscriptionCheckSchema = z.object({
  user_id: z.string().uuid('ID do usuário inválido')
})

// Enhanced User profile validations
export const UserProfileSchema = z.object({
  nome: z.string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome muito longo')
    .trim(),
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Telefone inválido')
    .optional()
    .or(z.literal('')),
  whatsapp: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'WhatsApp inválido')
    .optional()
    .or(z.literal(''))
})

// Enhanced validation helper functions with better error handling
export const validateTransaction = (data: unknown): z.SafeParseReturnType<unknown, z.infer<typeof TransactionSchema>> => {
  return TransactionSchema.safeParse(data)
}

export const validateTransactionUpdate = (data: unknown): z.SafeParseReturnType<unknown, z.infer<typeof TransactionUpdateSchema>> => {
  return TransactionUpdateSchema.safeParse(data)
}

export const validateCategory = (data: unknown): z.SafeParseReturnType<unknown, z.infer<typeof CategorySchema>> => {
  return CategorySchema.safeParse(data)
}

export const validateUserProfile = (data: unknown): z.SafeParseReturnType<unknown, z.infer<typeof UserProfileSchema>> => {
  return UserProfileSchema.safeParse(data)
}

export const validateSubscriptionCheck = (data: unknown): z.SafeParseReturnType<unknown, z.infer<typeof SubscriptionCheckSchema>> => {
  return SubscriptionCheckSchema.safeParse(data)
}

export const validateRecurringTransaction = (data: unknown): z.SafeParseReturnType<unknown, z.infer<typeof RecurringTransactionSchema>> => {
  return RecurringTransactionSchema.safeParse(data)
}

// Utility function to format validation errors
export const formatValidationErrors = (errors: z.ZodError): Record<string, string> => {
  const formattedErrors: Record<string, string> = {}
  
  errors.errors.forEach((error) => {
    const path = error.path.join('.')
    formattedErrors[path] = error.message
  })
  
  return formattedErrors
}
