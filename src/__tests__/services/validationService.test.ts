
import { describe, it, expect } from 'vitest'
import { ValidationService } from '@/services/validationService'

describe('ValidationService', () => {
  describe('validateTransactionValue', () => {
    it('should return null for valid values', () => {
      expect(ValidationService.validateTransactionValue(100)).toBeNull()
      expect(ValidationService.validateTransactionValue(999999)).toBeNull()
    })

    it('should return error for zero or negative values', () => {
      expect(ValidationService.validateTransactionValue(0)).toBe('O valor deve ser maior que zero')
      expect(ValidationService.validateTransactionValue(-100)).toBe('O valor deve ser maior que zero')
    })

    it('should return error for values exceeding maximum', () => {
      const result = ValidationService.validateTransactionValue(1000001)
      expect(result).toContain('O valor não pode exceder')
    })
  })

  describe('validateDescription', () => {
    it('should return null for valid descriptions', () => {
      expect(ValidationService.validateDescription('Valid description')).toBeNull()
    })

    it('should return error for empty descriptions', () => {
      expect(ValidationService.validateDescription('')).toBe('A descrição é obrigatória')
      expect(ValidationService.validateDescription('   ')).toBe('A descrição é obrigatória')
    })

    it('should return error for descriptions exceeding maximum length', () => {
      const longDescription = 'a'.repeat(256)
      const result = ValidationService.validateDescription(longDescription)
      expect(result).toContain('A descrição não pode exceder')
    })
  })

  describe('validateEmail', () => {
    it('should return null for valid emails', () => {
      expect(ValidationService.validateEmail('test@example.com')).toBeNull()
      expect(ValidationService.validateEmail('user.name+tag@domain.co.uk')).toBeNull()
    })

    it('should return error for invalid emails', () => {
      expect(ValidationService.validateEmail('invalid-email')).toBe('Por favor, insira um email válido')
      expect(ValidationService.validateEmail('test@')).toBe('Por favor, insira um email válido')
      expect(ValidationService.validateEmail('@domain.com')).toBe('Por favor, insira um email válido')
    })
  })

  describe('validatePassword', () => {
    it('should return null for valid passwords', () => {
      expect(ValidationService.validatePassword('Password123')).toBeNull()
      expect(ValidationService.validatePassword('MySecure1Pass')).toBeNull()
    })

    it('should return error for short passwords', () => {
      expect(ValidationService.validatePassword('Pass1')).toContain('A senha deve ter pelo menos')
    })

    it('should return error for passwords missing requirements', () => {
      expect(ValidationService.validatePassword('password123')).toContain('deve conter pelo menos')
      expect(ValidationService.validatePassword('PASSWORD123')).toContain('deve conter pelo menos')
      expect(ValidationService.validatePassword('Password')).toContain('deve conter pelo menos')
    })
  })
})
