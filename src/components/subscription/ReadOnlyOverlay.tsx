
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, Crown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface ReadOnlyOverlayProps {
  message?: string
  showUpgrade?: boolean
}

export function ReadOnlyOverlay({ 
  message = "Esta funcionalidade está disponível apenas na versão premium",
  showUpgrade = true 
}: ReadOnlyOverlayProps) {
  const navigate = useNavigate()

  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
      <Card className="max-w-sm mx-4">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-lg">Funcionalidade Premium</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        {showUpgrade && (
          <CardContent className="text-center">
            <Button 
              onClick={() => navigate('/plano')}
              className="w-full"
            >
              <Crown className="w-4 h-4 mr-2" />
              Fazer Upgrade
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
