
import { BUSINESS_RULES, ERROR_MESSAGES } from '@/config/constants'

export class ValidationService {
  static validateTransactionValue(value: number): string | null {
    if (value <= 0) {
      return 'O valor deve ser maior que zero'
    }
    if (value > BUSINESS_RULES.MAX_TRANSACTION_VALUE) {
      return `O valor não pode exceder ${BUSINESS_RULES.MAX_TRANSACTION_VALUE.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
    }
    return null
  }

  static validateDescription(description: string): string | null {
    if (!description.trim()) {
      return 'A descrição é obrigatória'
    }
    if (description.length > BUSINESS_RULES.MAX_DESCRIPTION_LENGTH) {
      return `A descrição não pode exceder ${BUSINESS_RULES.MAX_DESCRIPTION_LENGTH} caracteres`
    }
    return null
  }

  static validatePassword(password: string): string | null {
    if (password.length < BUSINESS_RULES.MIN_PASSWORD_LENGTH) {
      return `A senha deve ter pelo menos ${BUSINESS_RULES.MIN_PASSWORD_LENGTH} caracteres`
    }
    
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    
    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      return 'A senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número'
    }
    
    return null
  }

  static validateEmail(email: string): string | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return 'Por favor, insira um email válido'
    }
    return null
  }

  static validateCategoryOwnership(categoryId: string, userCategories: any[]): boolean {
    return userCategories.some(cat => cat.id === categoryId)
  }
}
