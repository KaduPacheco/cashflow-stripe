
import { useSubscription } from '@/hooks/useSubscription'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useReadOnlyMode } from '@/hooks/useReadOnlyMode'

export function SubscriptionBanner() {
  const { subscriptionData, loading } = useSubscription()
  const { isReadOnly } = useReadOnlyMode()
  const navigate = useNavigate()

  if (loading || subscriptionData.subscribed) {
    return null
  }

  return (
    <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800 dark:text-amber-200">
        {isReadOnly ? 'Modo Apenas Visualização' : 'Acesso Limitado'}
      </AlertTitle>
      <AlertDescription className="text-amber-700 dark:text-amber-300">
        {isReadOnly 
          ? 'Você está no modo apenas visualização. Para criar, editar ou deletar registros, '
          : 'Você tem acesso limitado. Para liberar todos os recursos, '
        }
        <button 
          onClick={() => navigate('/plano')}
          className="underline font-medium hover:no-underline"
        >
          faça upgrade para a versão premium
        </button>
        .
      </AlertDescription>
    </Alert>
  )
}
