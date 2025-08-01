import { useState, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { LoginForm } from '@/components/auth/LoginForm'
import { SignUpForm } from '@/components/auth/SignUpForm'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

export default function Auth() {
  const [currentForm, setCurrentForm] = useState<'login' | 'signup' | 'forgot'>('login')
  const { user, loading } = useAuth()
  const location = useLocation()

  // Mostrar mensagem se veio da página de reset de senha
  useEffect(() => {
    if (location.state?.message) {
      toast.success('Sucesso!', {
        description: location.state.message
      })
    }
  }, [location.state])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {currentForm === 'login' && (
          <LoginForm 
            onSwitchToSignUp={() => setCurrentForm('signup')}
            onSwitchToForgot={() => setCurrentForm('forgot')}
          />
        )}
        {currentForm === 'signup' && (
          <SignUpForm onSwitchToLogin={() => setCurrentForm('login')} />
        )}
        {currentForm === 'forgot' && (
          <ForgotPasswordForm onBack={() => setCurrentForm('login')} />
        )}
      </div>
    </div>
  )
}
