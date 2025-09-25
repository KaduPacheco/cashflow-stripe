
import { useSubscription } from '@/hooks/useSubscription'

export function useReadOnlyMode() {
  const { subscriptionData, loading } = useSubscription()
  
  // Usuário está em modo apenas leitura se não tem assinatura ativa
  const isReadOnly = !loading && !subscriptionData?.subscribed
  
  return {
    isReadOnly,
    isLoading: loading
  }
}
