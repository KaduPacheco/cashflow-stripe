
import { NavLink, useLocation } from 'react-router-dom'
import { BarChart3, ArrowDown, ArrowUp, FileText, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { title: 'Painel', url: '/contas/painel', icon: BarChart3 },
  { title: 'A Pagar', url: '/contas/pagar', icon: ArrowDown },
  { title: 'A Receber', url: '/contas/receber', icon: ArrowUp },
  { title: 'Relatórios', url: '/contas/relatorios', icon: FileText },
  { title: 'Configurações', url: '/contas/configuracoes', icon: Settings },
]

export function ContasSidebar() {
  const location = useLocation()

  return (
    <div className="h-full p-4">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">
          Contas a Pagar/Receber
        </h2>
        <p className="text-sm text-muted-foreground">
          Gestão financeira completa
        </p>
      </div>
      
      <nav className="space-y-2">
        {items.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.title}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
