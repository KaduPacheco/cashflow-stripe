
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface SyncResult {
  sucesso: boolean
  mensagem: string
  resumo?: {
    clientesSincronizados: number
    assinaturasProcessadas: number
    sessoesProcessadas: number
    erros: number
    totalProcessado: number
    assinaturasAtivas: number
    usuariosPremium: number
    usuariosVIP: number
    usuariosSemPerfil: number
  }
  exemplosAtivos?: Array<{
    email: string
    tier: string
    status: string
  }>
  erro?: string
}

export function StripeSyncButton() {
  const [loading, setLoading] = useState(false)
  const [lastSync, setLastSync] = useState<SyncResult | null>(null)

  const handleSync = async () => {
    setLoading(true)
    try {
      console.log('Iniciando sincronização do Stripe...')
      
      const { data, error } = await supabase.functions.invoke('sync-stripe-customers')
      
      if (error) {
        console.error('Erro na sincronização:', error)
        throw error
      }

      console.log('Resultado da sincronização:', data)
      setLastSync(data)
      
      if (data.sucesso) {
        toast({
          title: "Sincronização concluída!",
          description: `${data.resumo?.clientesSincronizados || 0} clientes sincronizados com sucesso.`,
        })
      } else {
        throw new Error(data.erro || 'Erro desconhecido na sincronização')
      }
    } catch (error: any) {
      console.error('Erro na sincronização:', error)
      toast({
        title: "Erro na sincronização",
        description: error.message || "Falha ao sincronizar clientes do Stripe",
        variant: "destructive",
      })
      setLastSync({
        sucesso: false,
        mensagem: "Erro na sincronização",
        erro: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Sincronização Stripe
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Sincroniza todos os clientes e assinaturas do Stripe com o banco de dados local.
            Processa assinaturas ativas, canceladas e sessões de checkout recentes.
          </p>
          
          <Button 
            onClick={handleSync} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Sincronizando...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Sincronizar Clientes Stripe
              </>
            )}
          </Button>

          {lastSync && (
            <Card className={lastSync.sucesso ? "border-green-200" : "border-red-200"}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  {lastSync.sucesso ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Última sincronização - Sucesso
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      Última sincronização - Erro
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {lastSync.sucesso && lastSync.resumo ? (
                  <>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Clientes sincronizados:</span>
                        <Badge variant="secondary" className="ml-2">
                          {lastSync.resumo.clientesSincronizados}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">Assinaturas ativas:</span>
                        <Badge variant="default" className="ml-2">
                          {lastSync.resumo.assinaturasAtivas}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">Usuários Premium:</span>
                        <Badge variant="outline" className="ml-2">
                          {lastSync.resumo.usuariosPremium}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">Usuários VIP:</span>
                        <Badge variant="outline" className="ml-2">
                          {lastSync.resumo.usuariosVIP}
                        </Badge>
                      </div>
                    </div>

                    {lastSync.resumo.erros > 0 && (
                      <div className="text-sm text-orange-600">
                        <AlertCircle className="h-4 w-4 inline mr-1" />
                        {lastSync.resumo.erros} erros durante o processamento
                      </div>
                    )}

                    {lastSync.exemplosAtivos && lastSync.exemplosAtivos.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Assinaturas Ativas (exemplos):</h4>
                        <div className="space-y-1">
                          {lastSync.exemplosAtivos.map((exemplo, index) => (
                            <div key={index} className="flex items-center gap-2 text-xs">
                              <span className="font-mono">{exemplo.email}</span>
                              <Badge size="sm" variant="secondary">{exemplo.tier}</Badge>
                              <span className="text-muted-foreground">{exemplo.status}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-sm text-red-600">
                    {lastSync.erro || lastSync.mensagem}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
