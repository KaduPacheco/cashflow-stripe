
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

  // Melhorar verificação de sessão de recuperação
  useEffect(() => {
    const checkRecoverySession = async () => {
      try {
        // Capturar parâmetros da URL que podem conter tokens
        const urlParams = new URLSearchParams(window.location.search)
        const hashParams = new URLSearchParams(window.location.hash.replace('#', ''))
        
        // Verificar se há tokens de acesso na URL
        const accessToken = urlParams.get('access_token') || hashParams.get('access_token')
        const refreshToken = urlParams.get('refresh_token') || hashParams.get('refresh_token')
        const tokenType = urlParams.get('token_type') || hashParams.get('token_type')
        const type = urlParams.get('type') || hashParams.get('type')
        
        SecureLogger.auth('Checking recovery tokens', { 
          hasAccessToken: !!accessToken, 
          hasRefreshToken: !!refreshToken,
          tokenType,
          type
        })

        // Se encontrarmos tokens na URL, definir a sessão
        if (accessToken && refreshToken && type === 'recovery') {
          SecureLogger.auth('Recovery tokens found in URL, setting session')
          
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })

          if (error) {
            SecureLogger.error('Error setting recovery session', error)
            setIsTokenValid(false)
            return
          }

          if (data.session && data.user) {
            SecureLogger.auth('Recovery session set successfully', { userId: data.user.id })
            setIsTokenValid(true)
            
            // Limpar a URL dos parâmetros de token por segurança
            const cleanUrl = window.location.pathname
            window.history.replaceState({}, document.title, cleanUrl)
            return
          }
        }

        // Verificar se há uma sessão ativa existente
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          SecureLogger.error('Error checking recovery session', error)
          setIsTokenValid(false)
          return
        }

        if (session && session.user) {
          // Verificar se a sessão é válida e não expirou
          const now = Math.floor(Date.now() / 1000)
          const expiresAt = session.expires_at || 0
          
          if (expiresAt > now) {
            setIsTokenValid(true)
            SecureLogger.auth('Valid recovery session found', { userId: session.user.id })
          } else {
            setIsTokenValid(false)
            SecureLogger.warn('Recovery session expired')
          }
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

    // Também escutar mudanças de estado de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      SecureLogger.auth('Auth state change in password reset', { event, hasSession: !!session })
      
      if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
        if (session && session.user) {
          setIsTokenValid(true)
        }
      } else if (event === 'SIGNED_OUT') {
        setIsTokenValid(false)
      }
    })

    return () => subscription.unsubscribe()
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
        
        if (error.message.includes('expired') || error.message.includes('invalid') || error.message.includes('session')) {
          toast.error('Sessão Expirada', {
            description: 'Sua sessão de recuperação expirou. Solicite um novo link de recuperação.'
          })
          setIsTokenValid(false)
          
          // Redirecionar para solicitar novo link após alguns segundos
          setTimeout(() => {
            navigate('/auth', { 
              state: { message: 'Sessão de recuperação expirada. Solicite um novo link.' }
            })
          }, 3000)
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
