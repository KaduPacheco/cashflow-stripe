
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSubscription } from '@/hooks/useSubscription'
import { CreditCard, RefreshCw, Settings, Calendar, CheckCircle, AlertTriangle, Clock, XCircle, AlertCircle } from 'lucide-react'

export function SubscriptionStatus() {
  const { subscriptionData, checking, checkSubscription, openCustomerPortal } = useSubscription()

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getStatusIcon = () => {
    if (!subscriptionData.subscribed) {
      switch (subscriptionData.status) {
        case 'canceled': return <XCircle className="h-4 w-4 text-red-600" />
        case 'expired': return <Clock className="h-4 w-4 text-orange-600" />
        case 'no_customer':
        case 'no_subscription': return <AlertCircle className="h-4 w-4 text-gray-600" />
        default: return <AlertTriangle className="h-4 w-4 text-orange-600" />
      }
    }
    
    switch (subscriptionData.status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'trialing': return <Clock className="h-4 w-4 text-blue-600" />
      case 'past_due': return <AlertTriangle className="h-4 w-4 text-orange-600" />
      default: return <CheckCircle className="h-4 w-4 text-green-600" />
    }
  }

  const getStatusBadge = () => {
    if (!subscriptionData.subscribed) {
      switch (subscriptionData.status) {
        case 'canceled':
          return <Badge variant="destructive">Cancelado</Badge>
        case 'expired':
          return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Expirado</Badge>
        case 'no_customer':
        case 'no_subscription':
          return <Badge variant="secondary">Sem Assinatura</Badge>
        default:
          return <Badge variant="secondary">Inativo</Badge>
      }
    }
    
    switch (subscriptionData.status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Ativo</Badge>
      case 'trialing':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Período de Teste</Badge>
      case 'past_due':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Pagamento Pendente</Badge>
      default:
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Ativo</Badge>
    }
  }

  const getStatusMessage = () => {
    if (subscriptionData.message) {
      return subscriptionData.message
    }
    
    if (subscriptionData.error) {
      return subscriptionData.error
    }
    
    return subscriptionData.subscribed ? 'Assinatura ativa' : 'Nenhuma assinatura ativa'
  }

  const isErrorState = !!subscriptionData.error
  const canManage = subscriptionData.subscribed && !isErrorState

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
            {getStatusIcon()}
            <span className="font-medium">Status:</span>
          </div>
          {getStatusBadge()}
        </div>

        {/* Mensagem de status */}
        <div className={`p-3 rounded-lg text-sm ${
          isErrorState 
            ? 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400' 
            : subscriptionData.subscribed 
            ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400'
            : 'bg-gray-50 dark:bg-gray-950/20 text-gray-700 dark:text-gray-400'
        }`}>
          {getStatusMessage()}
        </div>

        {subscriptionData.subscription_tier && (
          <div className="flex items-center justify-between">
            <span className="font-medium">Plano:</span>
            <span className="capitalize">{subscriptionData.subscription_tier}</span>
          </div>
        )}

        {subscriptionData.subscription_end && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">
                {subscriptionData.subscribed ? 'Próxima Cobrança:' : 'Expirou em:'}
              </span>
            </div>
            <span className={subscriptionData.subscribed ? '' : 'text-red-600'}>
              {formatDate(subscriptionData.subscription_end)}
            </span>
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
            {checking ? 'Verificando...' : 'Atualizar'}
          </Button>
          
          {canManage && (
            <Button
              variant="outline"
              size="sm"
              onClick={openCustomerPortal}
            >
              <Settings className="h-4 w-4 mr-2" />
              Gerenciar
            </Button>
          )}
        </div>

        {/* Debug info for errors */}
        {subscriptionData.errorType && (
          <div className="text-xs text-muted-foreground mt-2">
            Tipo do erro: {subscriptionData.errorType}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
