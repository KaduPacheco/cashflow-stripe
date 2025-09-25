
import { useSubscription } from '@/hooks/useSubscription'
import { SubscriptionStatus } from '@/components/subscription/SubscriptionStatus'

export function SubscriptionInfo() {
  const { subscriptionData, loading } = useSubscription()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!subscriptionData.subscribed) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">Você não possui uma assinatura ativa</p>
      </div>
    )
  }

  return <SubscriptionStatus />
}
