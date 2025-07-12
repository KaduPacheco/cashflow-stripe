
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/useTheme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button 
      variant="outline" 
      size="icon"
      onClick={toggleTheme}
      className="bg-background/80 backdrop-blur-sm border-border/50 transition-all duration-300 hover:scale-105 hover:bg-accent hover:border-border shadow-fintech"
    >
      {theme === 'light' ? (
        <Moon className="h-[1.2rem] w-[1.2rem] transition-all duration-300 rotate-0 scale-100 text-muted-foreground" />
      ) : (
        <Sun className="h-[1.2rem] w-[1.2rem] transition-all duration-300 rotate-0 scale-100 text-primary" />
      )}
      <span className="sr-only">Alternar tema</span>
    </Button>
  )
}
