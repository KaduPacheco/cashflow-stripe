
import { supabase } from '@/lib/supabase'
import { SecureLogger } from '@/lib/logger'
import { EnhancedRateLimiter } from '@/lib/enhancedSecurity'
import { AuthSecurityManager } from './authSecurity'

// Sistema de validação de sessão seguro
export class SecureAuthManager {
  private static readonly SESSION_REFRESH_THRESHOLD = 5 * 60 * 1000 // 5 minutos
  private static readonly MAX_PASSWORD_ATTEMPTS = 3
  private static passwordAttempts = new Map<string, { count: number; resetTime: number }>()

  static isSessionValid(session: any): boolean {
    const validation = AuthSecurityManager.validateSession(session)
    return validation.isValid
  }

  static shouldRefreshSession(session: any): boolean {
    const validation = AuthSecurityManager.validateSession(session)
    return validation.shouldRefresh
  }

  static async changePasswordSecurely(
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Verificar rate limiting por usuário
      const attemptKey = `password_change_${userId}`
      const now = Date.now()
      const attempt = this.passwordAttempts.get(attemptKey)
      
      if (attempt && now < attempt.resetTime && attempt.count >= this.MAX_PASSWORD_ATTEMPTS) {
        throw new Error('Muitas tentativas de alteração de senha. Tente novamente em 1 hora.')
      }

      // Use enhanced password validation
      const result = await AuthSecurityManager.changePassword(
        currentPassword,
        newPassword,
        confirmPassword
      )

      if (!result.success) {
        // Incrementar contador de tentativas
        const currentAttempt = this.passwordAttempts.get(attemptKey) || { count: 0, resetTime: 0 }
        this.passwordAttempts.set(attemptKey, {
          count: currentAttempt.count + 1,
          resetTime: now + (60 * 60 * 1000) // Reset em 1 hora
        })
        
        return result
      }

      // Limpar tentativas em caso de sucesso
      this.passwordAttempts.delete(attemptKey)
      
      return { success: true }

    } catch (error: any) {
      SecureLogger.error('Password change failed', { error: error.message, userId: '***MASKED***' })
      return { success: false, error: error.message }
    }
  }

  static async secureLogin(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Rate limiting - fix the parameter type issue
      if (!EnhancedRateLimiter.checkLimit(email, 'login', 5)) {
        throw new Error('Muitas tentativas de login. Tente novamente em alguns minutos.')
      }
      
      // Use enhanced login
      return await AuthSecurityManager.secureLogin(email, password)
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static clearUserSessions(userId: string) {
    this.passwordAttempts.delete(`password_change_${userId}`)
    SecureLogger.auth('User sessions cleared', { userId: '***MASKED***' })
  }

  static getPasswordRequirements(): string[] {
    return AuthSecurityManager.getPasswordRequirements()
  }
}
