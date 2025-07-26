
import { useState, useEffect, createContext, useContext } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { SecureLogger } from '@/lib/logger'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, metadata?: { nome?: string; phone?: string; whatsapp?: string }) => Promise<{ error: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Função para limpar estado local
  const clearAuthState = () => {
    SecureLogger.auth('Clearing auth state')
    setSession(null)
    setUser(null)
    // Limpar localStorage forçadamente
    try {
      localStorage.removeItem('sb-csvkgokkvbtojjkitodc-auth-token')
      localStorage.removeItem('supabase.auth.token')
    } catch (error) {
      SecureLogger.error('Error clearing localStorage', error)
    }
  }

  useEffect(() => {
    SecureLogger.auth('AuthProvider initializing...')
    
    // Configurar listener de mudanças de auth PRIMEIRO
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        SecureLogger.auth('Auth state change', { event, hasSession: !!session })
        
        if (event === 'SIGNED_OUT' || !session) {
          clearAuthState()
        } else if (session) {
          setSession(session)
          setUser(session.user)
        }
        
        setLoading(false)
      }
    )

    // DEPOIS verificar sessão existente
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      SecureLogger.auth('Initial session check', { hasSession: !!session, hasError: !!error })
      
      if (error) {
        SecureLogger.error('Error getting session', error)
        clearAuthState()
        setLoading(false)
        return
      }

      if (session) {
        setSession(session)
        setUser(session.user)
      } else {
        clearAuthState()
      }
      
      setLoading(false)
    })

    return () => {
      SecureLogger.auth('AuthProvider cleanup')
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    SecureLogger.auth('Attempting sign in', { email: '***MASKED***' })
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        SecureLogger.error('Sign in error', error)
        return { error }
      }

      if (data.user && data.session) {
        SecureLogger.auth('Sign in successful', { userId: data.user.id })
        return { error: null }
      }

      return { error: new Error('Login falhou - dados inválidos') }
    } catch (error) {
      SecureLogger.error('Sign in exception', error)
      return { error }
    }
  }

  const signUp = async (email: string, password: string, metadata?: { nome?: string; phone?: string; whatsapp?: string }) => {
    SecureLogger.auth('Attempting sign up', { email: '***MASKED***' })
    const redirectUrl = `${window.location.origin}/`
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: metadata || {}
      }
    })
    if (error) {
      SecureLogger.error('Sign up error', error)
    }
    return { error }
  }

  const signOut = async () => {
    SecureLogger.auth('Attempting sign out...')
    
    try {
      // Tentar fazer logout no servidor
      const { error } = await supabase.auth.signOut()
      if (error) {
        SecureLogger.error('Server sign out error', error)
      }
    } catch (error) {
      SecureLogger.error('Sign out request failed', error)
    }
    
    // Independentemente do resultado, limpar estado local
    clearAuthState()
    SecureLogger.auth('Sign out completed (local state cleared)')
  }

  const resetPassword = async (email: string) => {
    SecureLogger.auth('Attempting password reset', { email: '***MASKED***' })
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) {
      SecureLogger.error('Password reset error', error)
    }
    return { error }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
