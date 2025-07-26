
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '@/hooks/useAdmin'
import { useAuth } from '@/hooks/useAuth'
import { SecureLogger } from '@/lib/logger'

interface AdminRouteProps {
  children: React.ReactNode
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { isAdmin, isLoading } = useAdmin()
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      // Log tentativa de acesso não autorizado
      SecureLogger.warn('Tentativa de acesso não autorizado ao painel admin', {
        userId: user?.id || 'anonymous',
        email: user?.email || 'no-email'
      })
      
      // Redirecionar para dashboard
      navigate('/dashboard', { replace: true })
    }
  }, [isAdmin, isLoading, navigate, user])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return <>{children}</>
}
