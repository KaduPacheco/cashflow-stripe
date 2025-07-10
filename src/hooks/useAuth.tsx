
import { useState, useEffect, useContext, createContext } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { SecureLogger } from '@/lib/logger'
import { SentryLogger } from '@/lib/sentry'
import { toast } from '@/hooks/use-toast'

interface AuthContextProps {
  user: any | null
  session: any | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
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

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      
      console.log('Tentativa de login para:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Erro de autenticação:', error)
        
        // Tratamento específico para erros de rede
        if (error.message === 'Failed to fetch' || error.message.includes('fetch')) {
          toast({
            title: "Erro de Conexão",
            description: "Verifique sua conexão com a internet e tente novamente em instantes.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Erro no login",
            description: error.message || "Credenciais inválidas",
            variant: "destructive",
          })
        }
        
        SentryLogger.captureEvent('Sign in failed', 'warning', {
          errorCode: error.message,
          email: '***MASKED***'
        })
        throw error
      }

      SecureLogger.auth('User signed in successfully')
      console.log('Login bem-sucedido:', data.user?.email)
      
      return { user: data.user, session: data.session }
    } catch (error: any) {
      console.error('Erro no processo de login:', error)
      
      // Tratamento adicional para erros de rede
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        toast({
          title: "Erro de Conexão",
          description: "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.",
          variant: "destructive",
        })
      }
      
      SecureLogger.auth('Sign in error', error)
      SentryLogger.captureError(
        error instanceof Error ? error : new Error('Sign in failed'),
        { action: 'sign_in' }
      )
      throw error
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
