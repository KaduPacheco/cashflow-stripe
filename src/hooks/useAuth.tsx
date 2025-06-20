
import { useState, useEffect, createContext, useContext } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

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
    console.log('Clearing auth state')
    setSession(null)
    setUser(null)
    // Limpar localStorage forçadamente
    try {
      localStorage.removeItem('sb-csvkgokkvbtojjkitodc-auth-token')
      localStorage.removeItem('supabase.auth.token')
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  }

  // Função para validar se a sessão é válida
  const isSessionValid = (session: Session | null): boolean => {
    if (!session) return false
    
    const now = Math.floor(Date.now() / 1000)
    const expiresAt = session.expires_at || 0
    
    // Considerar sessão inválida se expira em menos de 1 minuto
    return expiresAt > (now + 60)
  }

  useEffect(() => {
    console.log('AuthProvider initializing...')
    
    // Configurar listener de mudanças de auth PRIMEIRO
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, !!session)
        
        if (event === 'SIGNED_OUT' || !session) {
          clearAuthState()
        } else if (session && isSessionValid(session)) {
          setSession(session)
          setUser(session.user)
        } else if (session && !isSessionValid(session)) {
          console.log('Invalid session detected, clearing...')
          clearAuthState()
        }
        
        setLoading(false)
      }
    )

    // DEPOIS verificar sessão existente
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('Initial session check:', !!session, error)
      
      if (error) {
        console.error('Error getting session:', error)
        clearAuthState()
        setLoading(false)
        return
      }

      if (session && isSessionValid(session)) {
        setSession(session)
        setUser(session.user)
      } else if (session && !isSessionValid(session)) {
        console.log('Initial session is invalid, clearing...')
        clearAuthState()
      } else {
        clearAuthState()
      }
      
      setLoading(false)
    })

    return () => {
      console.log('AuthProvider cleanup')
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    console.log('Attempting sign in for:', email)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      console.error('Sign in error:', error)
    }
    return { error }
  }

  const signUp = async (email: string, password: string, metadata?: { nome?: string; phone?: string; whatsapp?: string }) => {
    console.log('Attempting sign up for:', email)
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
      console.error('Sign up error:', error)
    }
    return { error }
  }

  const signOut = async () => {
    console.log('Attempting sign out...')
    
    try {
      // Tentar fazer logout no servidor
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Server sign out error:', error)
      }
    } catch (error) {
      console.error('Sign out request failed:', error)
    }
    
    // Independentemente do resultado, limpar estado local
    clearAuthState()
    console.log('Sign out completed (local state cleared)')
  }

  const resetPassword = async (email: string) => {
    console.log('Attempting password reset for:', email)
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) {
      console.error('Password reset error:', error)
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
