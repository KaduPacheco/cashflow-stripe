
import { useState } from "react"
import { 
  Home, 
  CreditCard, 
  Bell, 
  FolderOpen, 
  BarChart3, 
  User, 
  Crown,
  Receipt,
  MessageCircle,
  LogOut
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { UserProfile } from "./UserProfile"
import { useAuth } from "@/hooks/useAuth"

const menuItems = [
  { 
    title: "Dashboard", 
    url: "/dashboard", 
    icon: Home,
    tourId: "dashboard"
  },
  { 
    title: "Transações", 
    url: "/transacoes", 
    icon: CreditCard,
    tourId: "transacoes"
  },
  { 
    title: "Contas a Pagar/Receber", 
    url: "/contas", 
    icon: Receipt,
  },
  { 
    title: "Lembretes", 
    url: "/lembretes", 
    icon: Bell,
    tourId: "lembretes"
  },
  { 
    title: "Categorias", 
    url: "/categorias", 
    icon: FolderOpen,
    tourId: "categorias"
  },
  { 
    title: "Relatórios", 
    url: "/relatorios", 
    icon: BarChart3 
  },
]

const bottomMenuItems = [
  { 
    title: "Perfil", 
    url: "/perfil", 
    icon: User 
  },
  { 
    title: "Plano", 
    url: "/plano", 
    icon: Crown 
  },
]

export function AppSidebar() {
  const location = useLocation()
  const currentPath = location.pathname
  const { signOut } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const isActive = (path: string) => currentPath === path
  const getNavClassName = (path: string) => 
    isActive(path) 
      ? "bg-primary/10 text-primary font-medium border-r-2 border-primary" 
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    } finally {
      setIsSigningOut(false)
    }
  }

  const handleWhatsAppSupport = () => {
    const whatsappUrl = "https://wa.me/5521959206442?text=Ol%C3%A1%2C%20preciso%20de%20suporte%20para%20o%20Cash%20Flow."
    window.open(whatsappUrl, '_blank')
  }

  return (
    <Sidebar className="transition-all duration-300 w-64">
      <SidebarContent className="flex flex-col h-full">
        {/* Main Navigation */}
        <SidebarGroup className="flex-1">
          <SidebarGroupLabel>
            Navegação Principal
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavClassName(item.url)}
                      data-tour={item.tourId}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="ml-3">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Bottom Section */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavClassName(item.url)}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="ml-3">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {/* Botão Suporte WhatsApp */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button 
                    onClick={handleWhatsAppSupport}
                    className="w-full flex items-center hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span className="ml-3">Suporte</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {/* Botão Sair */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button 
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="w-full flex items-center hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="ml-3">
                      {isSigningOut ? "Saindo..." : "Sair"}
                    </span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Profile */}
        <div className="p-4 border-t border-border">
          <UserProfile />
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
