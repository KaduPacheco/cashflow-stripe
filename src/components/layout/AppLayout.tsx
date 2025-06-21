
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { ThemeToggle } from '@/components/ui/theme-toggle'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset>
          <header className="h-14 sm:h-16 flex items-center justify-between px-3 sm:px-6 bg-card border-b shadow-sm sticky top-0 z-40">
            <div className="flex items-center gap-2 sm:gap-4">
              <SidebarTrigger />
              <div className="hidden sm:block">
                <h1 className="text-sm md:text-lg font-semibold title-color">
                  Cash Flow - Sistema de Gestão Financeira
                </h1>
              </div>
              <div className="sm:hidden">
                <h1 className="text-xs font-semibold title-color">
                  Cash Flow
                </h1>
              </div>
            </div>
            <ThemeToggle />
          </header>
          <div className="flex-1 p-3 sm:p-4 md:p-6 bg-background">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
