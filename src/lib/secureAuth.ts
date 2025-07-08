
import { supabase } from '@/lib/supabase'
import { SecureLogger } from '@/lib/logger'
import { validateRateLimit } from './security'

// Sistema de validação de sessão seguro
export class SecureAuthManager {
  private static readonly SESSION_REFRESH_THRESHOLD = 5 * 60 * 1000 // 5 minutos
  private static readonly MAX_PASSWORD_ATTEMPTS = 3
  private static passwordAttempts = new Map<string, { count: number; resetTime: number }>()

  static isSessionValid(session: any): boolean {
    if (!session || !session.expires_at) return false
    
    const now = Math.floor(Date.now() / 1000)
    const expiresAt = session.expires_at
    
    // Sessão deve expirar em mais de 5 minutos
    return expiresAt > (now + 300)
  }

  static shouldRefreshSession(session: any): boolean {
    if (!session || !session.expires_at) return false
    
    const now = Date.now()
    const expiresAt = session.expires_at * 1000
    
    // Renovar se expira em menos de 5 minutos
    return (expiresAt - now) < this.SESSION_REFRESH_THRESHOLD
  }

  static async changePasswordSecurely(newPassword: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Verificar rate limiting por usuário
      const attemptKey = `password_change_${userId}`
      const now = Date.now()
      const attempt = this.passwordAttempts.get(attemptKey)
      
      if (attempt && now < attempt.resetTime && attempt.count >= this.MAX_PASSWORD_ATTEMPTS) {
        throw new Error('Muitas tentativas de alteração de senha. Tente novamente em 1 hora.')
      }

      // Validar força da senha
      if (newPassword.length < 8) {
        throw new Error('A senha deve ter pelo menos 8 caracteres')
      }

      const hasUpperCase = /[A-Z]/.test(newPassword)
      const hasLowerCase = /[a-z]/.test(newPassword)
      const hasNumber = /\d/.test(newPassword)
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)

      if (!(hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar)) {
        throw new Error('A senha deve conter pelo menos: 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial')
      }

      // Usar Supabase Auth para alterar senha de forma segura
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        // Incrementar contador de tentativas
        const currentAttempt = this.passwordAttempts.get(attemptKey) || { count: 0, resetTime: 0 }
        this.passwordAttempts.set(attemptKey, {
          count: currentAttempt.count + 1,
          resetTime: now + (60 * 60 * 1000) // Reset em 1 hora
        })
        
        throw error
      }

      // Limpar tentativas em caso de sucesso
      this.passwordAttempts.delete(attemptKey)
      
      SecureLogger.auth('Password changed successfully', { userId: '***MASKED***' })
      return { success: true }

    } catch (error: any) {
      SecureLogger.error('Password change failed', { error: error.message, userId: '***MASKED***' })
      return { success: false, error: error.message }
    }
  }

  static clearUserSessions(userId: string) {
    this.passwordAttempts.delete(`password_change_${userId}`)
    SecureLogger.auth('User sessions cleared', { userId: '***MASKED***' })
  }
}
