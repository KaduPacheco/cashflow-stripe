
import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAdmin } from '@/hooks/useAdmin'
import { SecureLogger } from '@/lib/logger'

interface AdminRedirectGuardProps {
  children: React.ReactNode
}

export function AdminRedirectGuard({ children }: AdminRedirectGuardProps) {
  const { isAdmin, isLoading } = useAdmin()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!isLoading && isAdmin && !location.pathname.startsWith('/admin-panel')) {
      SecureLogger.info('Admin user accessing regular pages, redirecting to admin panel', {
        currentPath: location.pathname
      })
      navigate('/admin-panel', { replace: true })
    }
  }, [isAdmin, isLoading, navigate, location.pathname])

  // Se for admin e não estiver no painel admin, não renderizar nada durante o redirecionamento
  if (!isLoading && isAdmin && !location.pathname.startsWith('/admin-panel')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecionando para painel administrativo...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
