
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSubscription } from '@/hooks/useSubscription'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, CreditCard, AlertTriangle, RefreshCw, LogOut, Wifi, Clock } from 'lucide-react'

interface SubscriptionGateProps {
  children: React.ReactNode
}

export function SubscriptionGate({ children }: SubscriptionGateProps) {
  const { subscriptionData, loading, createCheckout, checkSubscription } = useSubscription()
  const { signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Check for checkout success in URL params
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('checkout') === 'success') {
      // Remove the param and refresh subscription
      navigate(window.location.pathname, { replace: true })
      window.location.reload()
    }
  }, [navigate])

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando assinatura...</p>
        </div>
      </div>
    )
  }

  if (!subscriptionData.subscribed) {
    const isSessionError = subscriptionData.errorType === 'session'
    const isNetworkError = subscriptionData.errorType === 'network'
    const isRateLimit = subscriptionData.errorType === 'rate_limit'

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full w-fit">
              {isNetworkError ? (
                <Wifi className="h-6 w-6 text-orange-600 dark:text-orange-500" />
              ) : isRateLimit ? (
                <Clock className="h-6 w-6 text-blue-600 dark:text-blue-500" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-500" />
              )}
            </div>
            <CardTitle className="text-xl">
              {isSessionError ? 'Sessão Expirada' : 
               isNetworkError ? 'Erro de Conexão' : 
               isRateLimit ? 'Verificação em Pausa' :
               'Assinatura Necessária'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            {isSessionError ? (
              <>
                <p className="text-muted-foreground">
                  Sua sessão expirou. Por favor, faça login novamente para continuar.
                </p>
                <div className="space-y-3">
                  <Button onClick={handleSignOut} className="w-full" size="lg">
                    <LogOut className="mr-2 h-4 w-4" />
                    Fazer Login Novamente
                  </Button>
                </div>
              </>
            ) : isNetworkError ? (
              <>
                <p className="text-muted-foreground">
                  Não foi possível verificar sua assinatura. Verifique sua conexão com a internet.
                </p>
                <div className="space-y-3">
                  <Button onClick={checkSubscription} className="w-full" size="lg">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Tentar Novamente
                  </Button>
                </div>
              </>
            ) : isRateLimit ? (
              <>
                <p className="text-muted-foreground">
                  O sistema está aguardando automaticamente para evitar sobrecarga. 
                  A verificação será retomada em breve.
                </p>
                <div className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                  Isso é normal e ajuda a manter o sistema estável para todos os usuários.
                </div>
                <div className="space-y-3">
                  <Button onClick={() => navigate('/plano')} className="w-full" size="lg">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Ver Planos Disponíveis
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-muted-foreground">
                  Para acessar o sistema, você precisa de uma assinatura ativa do Plano Agente Financeiro.
                </p>
                
                <div className="bg-primary/10 rounded-lg p-4">
                  <div className="font-semibold text-primary mb-2">Plano Agente Financeiro</div>
                  <div className="text-2xl font-bold mb-1">R$ 34,90/mês</div>
                  <div className="text-sm text-muted-foreground">
                    Acesso completo ao sistema de gestão financeira
                  </div>
                </div>

                <div className="space-y-3">
                  <Button onClick={createCheckout} className="w-full" size="lg">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Assinar Agora
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/plano')} 
                    className="w-full"
                  >
                    Ver Detalhes do Plano
                  </Button>

                  <Button 
                    variant="ghost" 
                    onClick={checkSubscription} 
                    className="w-full"
                    size="sm"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Verificar Novamente
                  </Button>
                </div>
              </>
            )}

            {subscriptionData.error && !isRateLimit && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {subscriptionData.error}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
