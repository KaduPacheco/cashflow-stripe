
import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useAdmin } from '@/hooks/useAdmin'
import { SecureLogger } from '@/lib/logger'

interface AdminRedirectGuardProps {
  children: React.ReactNode
}

export function AdminRedirectGuard({ children }: AdminRedirectGuardProps) {
  const { user, loading: authLoading } = useAuth()
  const { isAdmin, isLoading: adminLoading } = useAdmin()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Não fazer redirecionamento se estiver na página de auth
    if (location.pathname === '/auth' || authLoading || adminLoading) {
      return
    }

    // Só redirecionar se o usuário estiver autenticado, for admin e não estiver no painel admin
    if (user && isAdmin && !location.pathname.startsWith('/admin-panel')) {
      SecureLogger.info('Admin user accessing regular pages, redirecting to admin panel', {
        currentPath: location.pathname
      })
      navigate('/admin-panel', { replace: true })
    }
  }, [user, isAdmin, authLoading, adminLoading, navigate, location.pathname])

  // Se for admin e não estiver no painel admin (e não for auth), não renderizar nada durante o redirecionamento
  if (user && !authLoading && !adminLoading && isAdmin && !location.pathname.startsWith('/admin-panel') && location.pathname !== '/auth') {
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
