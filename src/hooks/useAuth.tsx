
import { useState, useEffect, useContext, createContext } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { SecureLogger } from '@/lib/logger'
import { SentryLogger } from '@/lib/sentry'
import { toast } from '@/hooks/use-toast'

interface AuthContextProps {
  user: any | null
  session: any | null
  loading: boolean
  signIn: (email: string, password: string, retryCount?: number) => Promise<any>
  signUp: (email: string, password: string, metadata?: any) => Promise<any>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<any>
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  session: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {}
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [session, setSession] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        SecureLogger.auth('Auth state change', { event, hasSession: !!session })
        
        if (event === 'SIGNED_IN' && session?.user) {
          SentryLogger.setUser(session.user.id)
          SentryLogger.captureEvent('User signed in', 'info', {
            authMethod: session.user.app_metadata?.provider || 'email'
          })
        } else if (event === 'SIGNED_OUT') {
          SentryLogger.clearUser()
          SentryLogger.captureEvent('User signed out', 'info')
        } else if (event === 'TOKEN_REFRESHED') {
          SentryLogger.captureEvent('Token refreshed', 'info')
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setSession(session)
          setUser(session?.user ?? null)
        } else if (event === 'SIGNED_OUT') {
          setSession(null)
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string, retryCount = 0) => {
    try {
      setLoading(true)
      
      console.log('Tentativa de login para:', email)
      
      // Tentativa direta sem retry automático
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Erro de autenticação:', error)
        
        // Tratamento específico para diferentes tipos de erro
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "Credenciais Inválidas",
            description: "Email ou senha incorretos. Verifique seus dados e tente novamente.",
            variant: "destructive",
          })
        } else if (
          error.message === 'Failed to fetch' || 
          error.message.includes('fetch') || 
          error.name === 'AbortError' || 
          error.message.includes('signal is aborted') ||
          error.message.includes('timeout') ||
          error.name === 'AuthRetryableFetchError'
        ) {
          // Retry apenas para erros de rede
          if (retryCount < 2) {
            console.log(`Tentando novamente... (${retryCount + 1}/2)`)
            await new Promise(resolve => setTimeout(resolve, 2000))
            return signIn(email, password, retryCount + 1)
          }
          
          toast({
            title: "Erro de conexão com Supabase",
            description: "Verifique sua rede ou recarregue a página.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Erro no login",
            description: "Ocorreu um erro inesperado. Tente novamente em alguns instantes.",
            variant: "destructive",
          })
        }
        
        SentryLogger.captureEvent('Sign in failed', 'warning', {
          errorCode: error.message,
          email: '***MASKED***',
          retryCount
        })
        return { error }
      }

      SecureLogger.auth('User signed in successfully')
      console.log('Login bem-sucedido:', data.user?.email)
      
      return { user: data.user, session: data.session }
    } catch (error: any) {
      console.error('Erro no processo de login:', error)
      
      // Tratamento para erros capturados
      if (error.message === 'Request timeout' || error.message === 'Connection timeout') {
        if (retryCount < 2) {
          console.log(`Timeout - tentando novamente... (${retryCount + 1}/2)`)
          await new Promise(resolve => setTimeout(resolve, 2000))
          return signIn(email, password, retryCount + 1)
        }
        
        toast({
          title: "Tempo Limite Excedido",
          description: "A conexão demorou muito para responder. Verifique sua internet e tente novamente.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Erro de Conectividade",
          description: "Verifique se você está conectado à internet ou se algum bloqueador está ativo.",
          variant: "destructive",
        })
      }
      
      SecureLogger.auth('Sign in error', error)
      SentryLogger.captureError(
        error instanceof Error ? error : new Error('Sign in failed'),
        { action: 'sign_in', retryCount }
      )
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/`
        }
      })

      if (error) {
        toast({
          title: "Erro no cadastro",
          description: error.message,
          variant: "destructive",
        })
        SentryLogger.captureEvent('Sign up failed', 'warning', {
          errorCode: error.message
        })
        throw error
      }

      SecureLogger.auth('User signed up successfully')
      SentryLogger.captureEvent('User signed up', 'info', {
        hasMetadata: !!metadata
      })
      
      return { user: data.user, session: data.session }
    } catch (error) {
      SecureLogger.auth('Sign up error', error)
      SentryLogger.captureError(
        error instanceof Error ? error : new Error('Sign up failed'),
        { action: 'sign_up' }
      )
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        SentryLogger.captureEvent('Sign out failed', 'warning', {
          errorCode: error.message
        })
        throw error
      }

      SecureLogger.auth('User signed out successfully')
    } catch (error) {
      SecureLogger.auth('Sign out error', error)
      SentryLogger.captureError(
        error instanceof Error ? error : new Error('Sign out failed'),
        { action: 'sign_out' }
      )
      throw error
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      })

      if (error) {
        SentryLogger.captureEvent('Reset password failed', 'warning', {
          errorCode: error.message,
          email: '***MASKED***'
        })
        throw error
      }

      SecureLogger.auth('Password reset email sent successfully')
    } catch (error) {
      SecureLogger.auth('Password reset error', error)
      SentryLogger.captureError(
        error instanceof Error ? error : new Error('Password reset failed'),
        { action: 'reset_password' }
      )
      throw error
    } finally {
      setLoading(false)
    }
  }

  const getUser = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.getUser()

      if (error) {
        console.warn('Erro ao obter usuário:', error.message)
        return
      }

      if (data.user) {
        SentryLogger.setUser(data.user.id)
        SentryLogger.captureEvent('User session restored', 'info', {
          authMethod: data.user.app_metadata?.provider || 'email'
        })
      }

      setUser(data.user)
      const { data: sessionData } = await supabase.auth.getSession()
      setSession(sessionData.session)
    } catch (error) {
      console.warn('Erro ao verificar sessão:', error)
      SecureLogger.error('Get user error', error)
      SentryLogger.captureError(
        error instanceof Error ? error : new Error('Get user failed'),
        { action: 'get_user' }
      )
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}
