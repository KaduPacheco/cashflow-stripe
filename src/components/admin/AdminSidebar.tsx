
import { NavLink, useLocation } from 'react-router-dom'
import { 
  BarChart3, 
  Users, 
  Shield, 
  Database, 
  Settings, 
  LogOut,
  Home
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

const menuItems = [
  { title: 'Dashboard', url: '/admin-panel', icon: Home, exact: true },
  { title: 'Usuários', url: '/admin-panel/users', icon: Users },
  { title: 'Logs de Segurança', url: '/admin-panel/security-logs', icon: Shield },
  { title: 'Análise do Sistema', url: '/admin-panel/analytics', icon: BarChart3 },
  { title: 'Base de Dados', url: '/admin-panel/database', icon: Database },
  { title: 'Configurações', url: '/admin-panel/settings', icon: Settings },
]

export function AdminSidebar() {
  const location = useLocation()
  const { signOut } = useAuth()

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700">
      <div className="p-6">
        <h1 className="text-xl font-bold text-red-400">
          Admin Panel
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Sistema de Administração
        </p>
      </div>
      
      <nav className="mt-6">
        <div className="px-3 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.title}
              to={item.url}
              className={({ isActive: navIsActive }) =>
                cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  navIsActive || isActive(item.url, item.exact)
                    ? "bg-gray-700 text-white border-l-4 border-red-400"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                )
              }
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.title}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="absolute bottom-0 w-64 p-4 border-t border-gray-700">
        <button
          onClick={signOut}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sair
        </button>
      </div>
    </div>
  )
}
