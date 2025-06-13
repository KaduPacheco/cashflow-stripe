
import { useSubscription } from '@/hooks/useSubscription'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreditCard, AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function SubscriptionBanner() {
  const { subscriptionData, loading, createCheckout } = useSubscription()
  const navigate = useNavigate()

  if (loading || subscriptionData.subscribed) {
    return null
  }

  return (
    <Card className="mb-6 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded-full">
            <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-1">
              Acesso Limitado
            </h3>
            <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
              Você está usando a versão gratuita. Assine o Plano Agente Financeiro para ter acesso completo.
            </p>
            <div className="flex gap-2">
              <Button onClick={createCheckout} size="sm" className="bg-orange-600 hover:bg-orange-700">
                <CreditCard className="mr-2 h-3 w-3" />
                Assinar R$ 34,90/mês
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/plano')}
                className="border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                Ver Plano
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
