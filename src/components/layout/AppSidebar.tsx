
import { NavLink, useLocation } from 'react-router-dom'
import { Home, CreditCard, Calendar, User, LogOut, Tag, FileText, Receipt } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { UserProfile } from './UserProfile'
import { useTheme } from '@/hooks/useTheme'

const items = [
  { title: 'Dashboard', url: '/dashboard', icon: Home },
  { title: 'Transações', url: '/transacoes', icon: CreditCard },
  { title: 'Contas a Pagar/Receber', url: '/contas', icon: Receipt },
  { title: 'Categorias', url: '/categorias', icon: Tag },
  { title: 'Relatórios', url: '/relatorios', icon: FileText },
  { title: 'Lembretes', url: '/lembretes', icon: Calendar },
  { title: 'Perfil', url: '/perfil', icon: User },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const { signOut } = useAuth()
  const { theme } = useTheme()
  const currentPath = location.pathname

  const isActive = (path: string) => currentPath === path
  const isCollapsed = state === "collapsed"

  // Determine which logo to use based on theme
  const getLogoSrc = () => {
    if (theme === 'dark') {
      return 'https://res.cloudinary.com/dio2sipj1/image/upload/v1749429600/5_jh9nh0.png' // logo-white
    } else if (theme === 'light') {
      return 'https://res.cloudinary.com/dio2sipj1/image/upload/v1749429599/1_ezh8mk.png' // logo-black
    } else {
      // System theme - check actual computed theme
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      return isDark 
        ? 'https://res.cloudinary.com/dio2sipj1/image/upload/v1749429600/5_jh9nh0.png'
        : 'https://res.cloudinary.com/dio2sipj1/image/upload/v1749429599/1_ezh8mk.png'
    }
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="p-4 border-b border-border">
        <div className="flex items-center justify-center">
          {isCollapsed ? (
            <div className="min-w-8">
              <img 
                src="/lovable-uploads/a5a40de7-4096-4a32-af0c-76fe03ec72f7.png"
                alt="Cash Flow Icon" 
                className="h-8 w-8"
              />
            </div>
          ) : (
            <img 
              src={getLogoSrc()} 
              alt="Cash Flow" 
              className="h-8 w-auto"
            />
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider fintech-muted font-medium px-3 py-2">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={`${
                      isActive(item.url)
                        ? 'bg-primary text-primary-foreground border-l-4 border-l-primary shadow-fintech fintech-interactive'
                        : 'hover:bg-accent fintech-interactive hover:border-l-4 hover:border-l-primary/30'
                    } rounded-xl mx-1 transition-all duration-200`}
                  >
                    <NavLink to={item.url} end className="flex items-center gap-3 px-3 py-2">
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 space-y-4 border-t border-border">
        <UserProfile />
        
        <Button
          onClick={signOut}
          variant="outline"
          size={isCollapsed ? "icon" : "default"}
          className="w-full fintech-interactive"
        >
          <LogOut className="h-4 w-4" />
          <span className="group-data-[collapsible=icon]:hidden ml-2">Sair</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
