
import { useAuth } from '@/hooks/useAuth'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function AdminHeader() {
  const { user } = useAuth()

  return (
    <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Painel Administrativo
          </h2>
          <p className="text-sm text-gray-400">
            Cash Flow - Sistema de Gestão Financeira
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-medium text-white">
              {user?.email}
            </p>
            <p className="text-xs text-gray-400">
              Administrador
            </p>
          </div>
          
          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">
              A
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
