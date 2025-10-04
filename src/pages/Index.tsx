
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

import { SecureLogger } from '@/lib/logger'

const Index = () => {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading) {
      SecureLogger.info('Index page - checking user status', { 
        hasUser: !!user, 
        authLoading 
      })

      if (user) {
        SecureLogger.info('User detected, redirecting to dashboard', { 
          userId: user.id 
        })
        navigate('/dashboard', { replace: true })
      } else {
        SecureLogger.info('No user found, redirecting to auth')
        navigate('/auth', { replace: true })
      }
    }
  }, [user, authLoading, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">
          {authLoading ? 'Carregando...' : 'Redirecionando...'}
        </p>
      </div>
    </div>
  )
}

export default Index
