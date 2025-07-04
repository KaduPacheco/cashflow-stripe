
import { ReactNode } from 'react'
import { useSubscription } from '@/hooks/useSubscription'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lock, Zap, RefreshCw } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface SubscriptionGateProps {
  children: ReactNode
  fallback?: ReactNode
}

export function SubscriptionGate({ children, fallback }: SubscriptionGateProps) {
  const { subscriptionData, loading, createCheckoutSession, refetch } = useSubscription()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (subscriptionData.subscribed) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <div className="space-y-6">
      <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
            <Lock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <CardTitle className="text-2xl text-amber-900 dark:text-amber-100">
            Recurso Premium
          </CardTitle>
          <CardDescription className="text-amber-700 dark:text-amber-300">
            Esta funcionalidade está disponível apenas para assinantes premium
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm text-amber-700 dark:text-amber-300">
              <Zap className="h-4 w-4" />
              <span>Acesso ilimitado a todas as funcionalidades</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-amber-700 dark:text-amber-300">
              <Zap className="h-4 w-4" />
              <span>Relatórios avançados e exportação</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-amber-700 dark:text-amber-300">
              <Zap className="h-4 w-4" />
              <span>Suporte prioritário</span>
            </div>
          </div>
          <div className="flex gap-3 justify-center pt-4">
            <Button
              onClick={createCheckoutSession}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Assinar Premium
            </Button>
            <Button
              variant="outline"
              onClick={refetch}
              className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Verificar Status
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
