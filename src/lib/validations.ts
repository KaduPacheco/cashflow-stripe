
import { z } from 'zod'

// Transaction validations
export const TransactionSchema = z.object({
  estabelecimento: z.string().min(1, 'Estabelecimento é obrigatório').max(255),
  valor: z.number().positive('Valor deve ser positivo').max(1000000, 'Valor máximo excedido'),
  tipo: z.enum(['receita', 'despesa']),
  category_id: z.string().uuid('ID da categoria inválido'),
  detalhes: z.string().max(500, 'Detalhes muito longos').optional(),
  quando: z.string().min(1, 'Data é obrigatória')
})

export const TransactionUpdateSchema = TransactionSchema.partial()

// Category validations
export const CategorySchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100),
  cor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor deve estar no formato hexadecimal'),
  icone: z.string().max(50).optional()
})

// Subscription validations
export const SubscriptionCheckSchema = z.object({
  user_id: z.string().uuid('ID do usuário inválido')
})

// User profile validations
export const UserProfileSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Telefone inválido').optional(),
  whatsapp: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'WhatsApp inválido').optional()
})

// Validation helper functions
export const validateTransaction = (data: unknown) => {
  return TransactionSchema.safeParse(data)
}

export const validateTransactionUpdate = (data: unknown) => {
  return TransactionUpdateSchema.safeParse(data)
}

export const validateCategory = (data: unknown) => {
  return CategorySchema.safeParse(data)
}

export const validateUserProfile = (data: unknown) => {
  return UserProfileSchema.safeParse(data)
}

export const validateSubscriptionCheck = (data: unknown) => {
  return SubscriptionCheckSchema.safeParse(data)
}
