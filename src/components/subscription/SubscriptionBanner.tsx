
import { useSubscription } from '@/hooks/useSubscription'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Crown, AlertCircle, RefreshCw } from 'lucide-react'

export function SubscriptionBanner() {
  const { subscriptionData, loading, refetch, createCheckoutSession } = useSubscription()

  if (loading) {
    return null
  }

  if (subscriptionData.subscribed) {
    return (
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-200 dark:border-blue-800">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full">
              <Crown className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                Assinatura Ativa
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {subscriptionData.message || 'Você tem acesso completo ao Cash Flow'}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 border-amber-200 dark:border-amber-800">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-full">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="font-semibold text-amber-900 dark:text-amber-100">
              Versão Gratuita
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Assine o plano premium para funcionalidades completas
            </p>
          </div>
        </div>
        <Button
          onClick={createCheckoutSession}
          className="bg-amber-600 hover:bg-amber-700 text-white"
        >
          Assinar Agora
        </Button>
      </CardContent>
    </Card>
  )
}
