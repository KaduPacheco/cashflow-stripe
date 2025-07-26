
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useAdmin } from '@/hooks/useAdmin'
import { SecureLogger } from '@/lib/logger'

const Index = () => {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const { isAdmin, isLoading: adminLoading } = useAdmin()

  useEffect(() => {
    // Aguardar que tanto a autenticação quanto a verificação admin sejam concluídas
    if (!authLoading && !adminLoading) {
      if (user) {
        if (isAdmin) {
          SecureLogger.info('Admin user detected, redirecting to admin panel', { 
            userId: user.id,
            email: user.email 
          })
          navigate('/admin-panel')
        } else {
          SecureLogger.info('Regular user detected, redirecting to dashboard', { 
            userId: user.id 
          })
          navigate('/dashboard')
        }
      } else {
        SecureLogger.info('No user found, redirecting to auth')
        navigate('/auth')
      }
    }
  }, [user, authLoading, adminLoading, isAdmin, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">
          {authLoading || adminLoading ? 'Verificando permissões...' : 'Carregando...'}
        </p>
      </div>
    </div>
  )
}

export default Index
