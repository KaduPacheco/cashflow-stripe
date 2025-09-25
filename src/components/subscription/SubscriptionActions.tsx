
import { Button } from '@/components/ui/button'
import { useSubscription } from '@/hooks/useSubscription'
import { toast } from 'sonner'
import { ExternalLink, RefreshCw } from 'lucide-react'

export function SubscriptionActions() {
  const { subscriptionData, createCheckout, openCustomerPortal, checkSubscription, loading } = useSubscription()

  const handleCreateCheckout = async () => {
    try {
      await createCheckout()
    } catch (error) {
      toast.error('Erro ao criar checkout', {
        description: 'Tente novamente em alguns instantes'
      })
    }
  }

  const handleOpenPortal = async () => {
    try {
      await openCustomerPortal()
    } catch (error) {
      toast.error('Erro ao abrir portal do cliente', {
        description: 'Tente novamente em alguns instantes'
      })
    }
  }

  const handleRefresh = async () => {
    try {
      await checkSubscription(true)
      toast.success('Status da assinatura atualizado')
    } catch (error) {
      toast.error('Erro ao atualizar status', {
        description: 'Tente novamente em alguns instantes'
      })
    }
  }

  if (!subscriptionData.subscribed) {
    return (
      <div className="flex flex-col gap-3">
        <Button 
          onClick={handleCreateCheckout}
          className="w-full"
          size="lg"
        >
          Assinar Premium - R$ 29,90/mês
        </Button>
        
        <Button 
          onClick={handleRefresh}
          variant="outline"
          className="gap-2"
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4" />
          Verificar Status
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <Button 
        onClick={handleOpenPortal}
        variant="outline"
        className="gap-2"
      >
        <ExternalLink className="h-4 w-4" />
        Gerenciar Assinatura
      </Button>
      
      <Button 
        onClick={handleRefresh}
        variant="outline"
        className="gap-2"
        disabled={loading}
      >
        <RefreshCw className="h-4 w-4" />
        Atualizar Status
      </Button>
    </div>
  )
}
