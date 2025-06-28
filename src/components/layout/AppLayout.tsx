
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset>
          <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-card/80 backdrop-blur-sm border-b border-border/50 shadow-sm sticky top-0 z-40">
            <div className="flex items-center gap-3 sm:gap-4">
              <SidebarTrigger className="hover:bg-accent rounded-lg p-2 transition-colors" />
              <div className="hidden sm:block">
                <h1 className="text-lg md:text-xl font-semibold title-color bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  Cash Flow - Sistema de Gestão Financeira
                </h1>
              </div>
              <div className="sm:hidden">
                <h1 className="text-sm font-semibold title-color bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  Cash Flow
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleRefresh}
                title="Atualizar página"
                className="hover:bg-accent rounded-xl"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <ThemeToggle />
            </div>
          </header>
          <div className="flex-1 p-4 sm:p-6 md:p-8 bg-gradient-to-br from-background to-muted/20 min-h-[calc(100vh-4rem)]">
            <div className="animate-fade-in">
              {children}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
