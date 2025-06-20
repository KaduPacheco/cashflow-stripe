
import { useSubscription } from '@/hooks/useSubscription'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Wifi, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useReadOnlyMode } from '@/hooks/useReadOnlyMode'

export function SubscriptionBanner() {
  const { subscriptionData, loading, checkSubscription } = useSubscription()
  const { isReadOnly } = useReadOnlyMode()
  const navigate = useNavigate()

  if (loading || subscriptionData.subscribed) {
    return null
  }

  const isSessionError = subscriptionData.errorType === 'session'
  const isNetworkError = subscriptionData.errorType === 'network'
  const isRateLimit = subscriptionData.errorType === 'rate_limit'

  if (isSessionError) {
    return (
      <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-800 dark:text-red-200">
          Sessão Expirada
        </AlertTitle>
        <AlertDescription className="text-red-700 dark:text-red-300 flex items-center justify-between">
          <span>Sua sessão expirou. Faça login novamente para continuar.</span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/auth')}
            className="ml-4"
          >
            Fazer Login
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (isNetworkError) {
    return (
      <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
        <Wifi className="h-4 w-4 text-orange-600" />
        <AlertTitle className="text-orange-800 dark:text-orange-200">
          Erro de Conexão
        </AlertTitle>
        <AlertDescription className="text-orange-700 dark:text-orange-300 flex items-center justify-between">
          <span>Não foi possível verificar sua assinatura. Verifique sua conexão.</span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={checkSubscription}
            className="ml-4"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Tentar Novamente
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (isRateLimit) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
        <Clock className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-800 dark:text-yellow-200">
          Muitas Tentativas
        </AlertTitle>
        <AlertDescription className="text-yellow-700 dark:text-yellow-300 flex items-center justify-between">
          <span>Aguarde alguns momentos antes de tentar verificar novamente.</span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={checkSubscription}
            className="ml-4"
            disabled
          >
            <Clock className="h-4 w-4 mr-1" />
            Aguarde
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800 dark:text-amber-200">
        {isReadOnly ? 'Modo Apenas Visualização' : 'Acesso Limitado'}
      </AlertTitle>
      <AlertDescription className="text-amber-700 dark:text-amber-300 flex items-center justify-between">
        <span>
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
        </span>
        <Button 
          variant="outline" 
          size="sm"
          onClick={checkSubscription}
          className="ml-4"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Verificar
        </Button>
      </AlertDescription>
    </Alert>
  )
}
