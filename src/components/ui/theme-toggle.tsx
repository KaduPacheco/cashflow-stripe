
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
      className="transition-all duration-200 hover:scale-105"
    >
      {theme === 'light' ? (
        <Moon className="h-[1.2rem] w-[1.2rem] transition-all duration-300 rotate-0 scale-100" />
      ) : (
        <Sun className="h-[1.2rem] w-[1.2rem] transition-all duration-300 rotate-0 scale-100" />
      )}
      <span className="sr-only">Alternar tema</span>
    </Button>
  )
}
