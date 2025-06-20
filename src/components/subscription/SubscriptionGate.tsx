
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSubscription } from '@/hooks/useSubscription'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, CreditCard, AlertTriangle } from 'lucide-react'

interface SubscriptionGateProps {
  children: React.ReactNode
}

export function SubscriptionGate({ children }: SubscriptionGateProps) {
  const { subscriptionData, loading, createCheckout } = useSubscription()
  const navigate = useNavigate()

  useEffect(() => {
    // Check for checkout success in URL params
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('checkout') === 'success') {
      // Remove the param and refresh subscription
      navigate(window.location.pathname, { replace: true })
      window.location.reload()
    }
  }, [navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando assinatura...</p>
        </div>
      </div>
    )
  }

  if (!subscriptionData.subscribed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full w-fit">
              <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-500" />
            </div>
            <CardTitle className="text-xl">Assinatura Necessária</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">
              Para acessar o sistema, você precisa de uma assinatura ativa do Plano Agente Financeiro.
            </p>
            
            <div className="bg-primary/10 rounded-lg p-4">
              <div className="font-semibold text-primary mb-2">Plano Agente Financeiro</div>
              <div className="text-2xl font-bold mb-1">R$ 34,90/mês</div>
              <div className="text-sm text-muted-foreground">
                Acesso completo ao sistema de gestão financeira
              </div>
            </div>

            <div className="space-y-3">
              <Button onClick={createCheckout} className="w-full" size="lg">
                <CreditCard className="mr-2 h-4 w-4" />
                Assinar Agora
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/plano')} 
                className="w-full"
              >
                Ver Detalhes do Plano
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
