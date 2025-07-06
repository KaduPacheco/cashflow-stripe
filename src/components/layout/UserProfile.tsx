
import { useAuth } from '@/hooks/useAuth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { useState } from 'react'

export function UserProfile() {
  const { user, signOut } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)

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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (!user) return null

  return (
    <div className="flex items-center justify-between gap-3 p-3 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.user_metadata?.avatar_url} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {user.user_metadata?.nome ? getInitials(user.user_metadata.nome) : user.email?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex flex-col min-w-0">
          <p className="text-sm font-medium truncate">
            {user.user_metadata?.nome || 'Usuário'}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {user.phone || user.email}
          </p>
        </div>
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={handleSignOut}
        disabled={isSigningOut}
        className="h-8 w-8 text-muted-foreground hover:text-foreground"
        title="Sair"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  )
}
