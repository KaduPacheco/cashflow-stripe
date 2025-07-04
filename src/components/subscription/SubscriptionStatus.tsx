
import { useSubscription } from '@/hooks/useSubscription'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Crown, Calendar, CreditCard, RefreshCw, ExternalLink } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export function SubscriptionStatus() {
  const { subscriptionData, loading, refetch, openCustomerPortal } = useSubscription()

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    )
  }

  if (!subscriptionData.subscribed) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Status da Assinatura
          </CardTitle>
          <CardDescription>
            Você não possui uma assinatura ativa no momento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Badge variant="secondary" className="mb-4">
              Plano Gratuito
            </Badge>
            <p className="text-sm text-muted-foreground mb-4">
              Funcionalidades limitadas disponíveis
            </p>
            <Button onClick={refetch} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Verificar Status
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-amber-500" />
          Status da Assinatura
        </CardTitle>
        <CardDescription>
          Gerencie sua assinatura e informações de pagamento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Plano:</span>
          <Badge variant="default" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
            {subscriptionData.subscription_tier || 'Premium'}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Ativo
          </Badge>
        </div>
        
        {subscriptionData.subscription_end && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Próxima cobrança:</span>
            <div className="flex items-center gap-1 text-sm">
              <Calendar className="h-4 w-4" />
              {new Date(subscriptionData.subscription_end).toLocaleDateString('pt-BR')}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <Button
            onClick={openCustomerPortal}
            variant="outline"
            className="flex-1"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Gerenciar Assinatura
          </Button>
          <Button
            onClick={refetch}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
