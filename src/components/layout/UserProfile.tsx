
import { useAuth } from '@/hooks/useAuth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function UserProfile() {
  const { user } = useAuth()

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
    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
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
  )
}
