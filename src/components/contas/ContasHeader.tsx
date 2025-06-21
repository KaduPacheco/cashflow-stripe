
import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { BarChart3, ArrowDown, ArrowUp, FileText, Settings, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const items = [
  { title: 'Painel', url: '/contas/painel', icon: BarChart3 },
  { title: 'A Pagar', url: '/contas/pagar', icon: ArrowDown },
  { title: 'A Receber', url: '/contas/receber', icon: ArrowUp },
  { title: 'Relatórios', url: '/contas/relatorios', icon: FileText },
  { title: 'Configurações', url: '/contas/configuracoes', icon: Settings },
]

export function ContasHeader() {
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const NavigationItems = ({ mobile = false, onItemClick }: { mobile?: boolean; onItemClick?: () => void }) => (
    <nav className={cn(
      "space-y-2",
      mobile ? "flex flex-col" : "hidden md:flex md:flex-row md:space-y-0 md:space-x-4"
    )}>
      {items.map((item) => (
        <NavLink
          key={item.title}
          to={item.url}
          onClick={onItemClick}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              mobile ? "w-full" : ""
            )
          }
        >
          <item.icon className="h-4 w-4" />
          {item.title}
        </NavLink>
      ))}
    </nav>
  )

  return (
    <header className="h-14 sm:h-16 flex items-center justify-between px-3 sm:px-6 bg-card border-b shadow-sm sticky top-0 z-40">
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile/Tablet Menu */}
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Contas a Pagar/Receber
                </h2>
                <p className="text-sm text-muted-foreground">
                  Gestão financeira completa
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <NavigationItems mobile onItemClick={() => setIsMenuOpen(false)} />
          </SheetContent>
        </Sheet>

        <div>
          <h1 className="text-sm sm:text-lg font-semibold text-foreground">
            Contas a Pagar/Receber
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
            Gestão financeira completa
          </p>
        </div>
      </div>

      {/* Desktop Navigation */}
      <NavigationItems />
    </header>
  )
}
