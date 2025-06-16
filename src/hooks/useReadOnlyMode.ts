
import { useSubscription } from '@/hooks/useSubscription'

export function useReadOnlyMode() {
  const { subscription, isLoading } = useSubscription()
  
  // Usuário está em modo apenas leitura se não tem assinatura ativa
  const isReadOnly = !isLoading && !subscription?.subscribed
  
  return {
    isReadOnly,
    isLoading
  }
}
