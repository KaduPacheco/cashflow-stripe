
import { useState } from "react"
import { 
  Home, 
  CreditCard, 
  Bell, 
  FolderOpen, 
  BarChart3, 
  User, 
  Crown,
  Receipt 
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
  useSidebar,
} from "@/components/ui/sidebar"
import { UserProfile } from "./UserProfile"

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
  const { collapsed } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname

  const isActive = (path: string) => currentPath === path
  const getNavClassName = (path: string) => 
    isActive(path) 
      ? "bg-primary/10 text-primary font-medium border-r-2 border-primary" 
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"

  return (
    <Sidebar className={`transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}>
      <SidebarContent className="flex flex-col h-full">
        {/* Main Navigation */}
        <SidebarGroup className="flex-1">
          <SidebarGroupLabel className={collapsed ? "opacity-0" : "opacity-100"}>
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
                      {!collapsed && <span className="ml-3">{item.title}</span>}
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
                      {!collapsed && <span className="ml-3">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Profile */}
        {!collapsed && (
          <div className="p-4 border-t border-border">
            <UserProfile />
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  )
}
