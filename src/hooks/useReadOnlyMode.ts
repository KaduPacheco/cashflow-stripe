
import { useSubscription } from '@/hooks/useSubscription'

export function useReadOnlyMode() {
  const { subscriptionData, loading } = useSubscription()
  
  // MODO GRATUITO PREMIUM: todos os usuários têm acesso completo
  // Anteriormente: const isReadOnly = !loading && !subscriptionData?.subscribed
  const isReadOnly = false // Sempre falso - acesso premium para todos
  
  return {
    isReadOnly,
    isLoading: loading
  }
}
