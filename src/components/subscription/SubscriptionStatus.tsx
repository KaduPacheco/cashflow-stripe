
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSubscription } from '@/hooks/useSubscription'
import { CreditCard, RefreshCw, Settings, Calendar, CheckCircle } from 'lucide-react'

export function SubscriptionStatus() {
  const { subscriptionData, checking, checkSubscription, openCustomerPortal } = useSubscription()

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Status da Assinatura
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="font-medium">Status:</span>
          </div>
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Ativo
          </Badge>
        </div>

        {subscriptionData.subscription_tier && (
          <div className="flex items-center justify-between">
            <span className="font-medium">Plano:</span>
            <span>{subscriptionData.subscription_tier}</span>
          </div>
        )}

        {subscriptionData.subscription_end && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">Próxima Cobrança:</span>
            </div>
            <span>{formatDate(subscriptionData.subscription_end)}</span>
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => checkSubscription(true)}
            disabled={checking}
          >
            {checking ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Atualizar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={openCustomerPortal}
          >
            <Settings className="h-4 w-4 mr-2" />
            Gerenciar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
