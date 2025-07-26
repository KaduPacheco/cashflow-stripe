
import { supabase } from '@/lib/supabase'
import { SecureLogger } from '@/lib/logger'

export class AuthSecurityManager {
  private static readonly PASSWORD_REQUIREMENTS = {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    minSpecialChars: 2,
    maxRepeatingChars: 2
  }

  private static readonly SESSION_CONFIG = {
    maxAge: 24 * 60 * 60, // 24 hours
    refreshThreshold: 5 * 60, // 5 minutes
    extendOnActivity: true
  }

  /**
   * Validate password strength with enhanced rules
   */
  static validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    const reqs = this.PASSWORD_REQUIREMENTS

    if (!password) {
      errors.push('Senha é obrigatória')
      return { isValid: false, errors }
    }

    if (password.length < reqs.minLength) {
      errors.push(`Senha deve ter pelo menos ${reqs.minLength} caracteres`)
    }

    if (reqs.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra maiúscula')
    }

    if (reqs.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra minúscula')
    }

    if (reqs.requireNumbers && !/\d/.test(password)) {
      errors.push('Senha deve conter pelo menos um número')
    }

    if (reqs.requireSpecialChars) {
      const specialChars = password.match(/[!@#$%^&*(),.?":{}|<>]/g)
      if (!specialChars || specialChars.length < reqs.minSpecialChars) {
        errors.push(`Senha deve conter pelo menos ${reqs.minSpecialChars} caracteres especiais`)
      }
    }

    // Check for repeating characters
    const repeatingPattern = new RegExp(`(.)\\1{${reqs.maxRepeatingChars},}`)
    if (repeatingPattern.test(password)) {
      errors.push(`Senha não deve ter mais de ${reqs.maxRepeatingChars} caracteres repetidos consecutivos`)
    }

    // Check for common patterns
    const commonPatterns = [
      /123456/,
      /password/i,
      /qwerty/i,
      /abc123/i,
      /admin/i
    ]

    for (const pattern of commonPatterns) {
      if (pattern.test(password)) {
        errors.push('Senha contém padrões comuns que devem ser evitados')
        break
      }
    }

    return { isValid: errors.length === 0, errors }
  }

  /**
   * Enhanced session validation
   */
  static validateSession(session: any): { isValid: boolean; shouldRefresh: boolean; error?: string } {
    if (!session || !session.expires_at) {
      return { isValid: false, shouldRefresh: false, error: 'Sessão inválida' }
    }

    const now = Math.floor(Date.now() / 1000)
    const expiresAt = session.expires_at
    const timeUntilExpiry = expiresAt - now

    if (timeUntilExpiry <= 0) {
      return { isValid: false, shouldRefresh: false, error: 'Sessão expirada' }
    }

    const shouldRefresh = timeUntilExpiry < this.SESSION_CONFIG.refreshThreshold
    const isValid = timeUntilExpiry > 0

    return { isValid, shouldRefresh }
  }

  /**
   * Secure password change with enhanced validation
   */
  static async changePassword(
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate new password confirmation
      if (newPassword !== confirmPassword) {
        return { success: false, error: 'Confirmação de senha não confere' }
      }

      // Validate password strength
      const validation = this.validatePasswordStrength(newPassword)
      if (!validation.isValid) {
        return { success: false, error: validation.errors.join('. ') }
      }

      // Check if new password is different from current
      if (currentPassword === newPassword) {
        return { success: false, error: 'A nova senha deve ser diferente da atual' }
      }

      // Attempt to update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        SecureLogger.error('Password change failed', { error: error.message })
        return { success: false, error: 'Erro ao alterar senha. Tente novamente.' }
      }

      SecureLogger.auth('Password changed successfully')
      return { success: true }

    } catch (error: any) {
      SecureLogger.error('Password change error', { error: error.message })
      return { success: false, error: 'Erro interno ao alterar senha' }
    }
  }

  /**
   * Enhanced login with security monitoring
   */
  static async secureLogin(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Basic email validation
      if (!email || !email.includes('@')) {
        return { success: false, error: 'Email inválido' }
      }

      // Rate limiting check would go here (implemented separately)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        SecureLogger.auth('Login failed', { 
          email: email.replace(/(.{2}).*@/, '$1***@'),
          error: error.message 
        })
        return { success: false, error: 'Credenciais inválidas' }
      }

      if (data.user) {
        SecureLogger.auth('Login successful', { 
          userId: data.user.id,
          email: email.replace(/(.{2}).*@/, '$1***@')
        })
        return { success: true }
      }

      return { success: false, error: 'Erro na autenticação' }

    } catch (error: any) {
      SecureLogger.error('Login error', { error: error.message })
      return { success: false, error: 'Erro interno de autenticação' }
    }
  }

  /**
   * Get password requirements for display
   */
  static getPasswordRequirements(): string[] {
    const reqs = this.PASSWORD_REQUIREMENTS
    return [
      `Pelo menos ${reqs.minLength} caracteres`,
      'Pelo menos 1 letra maiúscula',
      'Pelo menos 1 letra minúscula',
      'Pelo menos 1 número',
      `Pelo menos ${reqs.minSpecialChars} caracteres especiais (!@#$%^&*)`
    ]
  }
}
