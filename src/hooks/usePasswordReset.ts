
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ValidationService } from '@/services/validationService'
import { SecureLogger } from '@/lib/logger'
import { XSSSecurityClient } from '@/lib/xssSecurity'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export function usePasswordReset() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null)
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({})
  const navigate = useNavigate()

  // Verificar se há uma sessão ativa (tokens de recuperação)
  useEffect(() => {
    const checkRecoverySession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          SecureLogger.error('Error checking recovery session', error)
          setIsTokenValid(false)
          return
        }

        // Verificar se há uma sessão ativa com tokens de recuperação
        if (session && session.user) {
          setIsTokenValid(true)
          SecureLogger.auth('Recovery session found', { userId: session.user.id })
        } else {
          setIsTokenValid(false)
          SecureLogger.warn('No recovery session found')
        }
      } catch (error) {
        SecureLogger.error('Recovery session check failed', error)
        setIsTokenValid(false)
      }
    }

    checkRecoverySession()
  }, [])

  const validatePasswords = (): boolean => {
    const newErrors: { password?: string; confirmPassword?: string } = {}

    // Validar senha
    const passwordError = ValidationService.validatePassword(password)
    if (passwordError) {
      newErrors.password = passwordError
    }

    // Validar confirmação
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem'
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const resetPassword = async () => {
    if (!validatePasswords()) {
      return
    }

    setIsLoading(true)
    
    try {
      // Sanitizar entrada
      const sanitizedPassword = XSSSecurityClient.sanitizeText(password)
      
      // Atualizar senha usando o método do Supabase
      const { error } = await supabase.auth.updateUser({
        password: sanitizedPassword
      })

      if (error) {
        SecureLogger.error('Password reset failed', { error: error.message })
        
        if (error.message.includes('expired') || error.message.includes('invalid')) {
          toast.error('Link Expirado', {
            description: 'Este link de recuperação expirou ou é inválido. Solicite um novo.'
          })
          setIsTokenValid(false)
        } else {
          toast.error('Erro ao Redefinir Senha', {
            description: 'Ocorreu um erro ao redefinir sua senha. Tente novamente.'
          })
        }
        return
      }

      SecureLogger.auth('Password reset successful')
      
      toast.success('Senha Redefinida!', {
        description: 'Sua senha foi alterada com sucesso. Você será redirecionado para o login.'
      })

      // Fazer logout para garantir que o usuário faça login com a nova senha
      await supabase.auth.signOut()

      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        navigate('/auth', { 
          state: { message: 'Senha redefinida com sucesso! Faça login com sua nova senha.' }
        })
      }, 2000)

    } catch (error: any) {
      SecureLogger.error('Password reset error', error)
      toast.error('Erro Interno', {
        description: 'Ocorreu um erro inesperado. Tente novamente mais tarde.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updatePassword = (value: string) => {
    setPassword(XSSSecurityClient.sanitizeText(value))
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: undefined }))
    }
  }

  const updateConfirmPassword = (value: string) => {
    setConfirmPassword(XSSSecurityClient.sanitizeText(value))
    if (errors.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: undefined }))
    }
  }

  return {
    password,
    confirmPassword,
    updatePassword,
    updateConfirmPassword,
    resetPassword,
    isLoading,
    isTokenValid,
    errors
  }
}
