
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { Loader2, RefreshCw } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface SyncSummary {
  syncedCustomers: number
  processedSubscriptions: number
  processedSessions: number
  errors: number
  totalProcessed: number
  activeSubscriptions: number
  premiumUsers: number
  vipUsers: number
  usersWithoutProfile: number
}

export function StripeSyncButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [syncSummary, setSyncSummary] = useState<SyncSummary | null>(null)
  const { session } = useAuth()

  const handleSync = async () => {
    if (!session) {
      toast.error('Você precisa estar logado para executar a sincronização')
      return
    }

    setIsLoading(true)
    
    try {
      toast.info('Iniciando sincronização com Stripe...', {
        description: 'Este processo pode levar alguns minutos'
      })

      const { data, error } = await supabase.functions.invoke('sync-stripe-customers', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (error) {
        throw error
      }

      if (data.success) {
        setSyncSummary(data.summary)
        setLastSync(new Date())
        
        toast.success('Sincronização concluída com sucesso!', {
          description: `${data.summary.syncedCustomers} clientes sincronizados, ${data.summary.activeSubscriptions} assinaturas ativas`
        })
      } else {
        throw new Error(data.error || 'Erro desconhecido na sincronização')
      }
    } catch (error: any) {
      console.error('Sync error:', error)
      toast.error('Erro na sincronização', {
        description: error.message || 'Erro desconhecido ao sincronizar clientes'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button 
          onClick={handleSync} 
          disabled={isLoading}
          variant="outline"
          className="gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {isLoading ? 'Sincronizando...' : 'Sincronizar Stripe'}
        </Button>
        
        {lastSync && (
          <span className="text-sm text-muted-foreground">
            Última sincronização: {lastSync.toLocaleString('pt-BR')}
          </span>
        )}
      </div>

      {syncSummary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/50">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{syncSummary.syncedCustomers}</div>
            <div className="text-sm text-muted-foreground">Clientes Sincronizados</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{syncSummary.activeSubscriptions}</div>
            <div className="text-sm text-muted-foreground">Assinaturas Ativas</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{syncSummary.premiumUsers}</div>
            <div className="text-sm text-muted-foreground">Usuários Premium</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{syncSummary.vipUsers}</div>
            <div className="text-sm text-muted-foreground">Usuários VIP</div>
          </div>
          
          {syncSummary.errors > 0 && (
            <div className="col-span-2 text-center">
              <div className="text-2xl font-bold text-red-600">{syncSummary.errors}</div>
              <div className="text-sm text-muted-foreground">Erros</div>
            </div>
          )}
          
          {syncSummary.usersWithoutProfile > 0 && (
            <div className="col-span-2 text-center">
              <div className="text-2xl font-bold text-yellow-600">{syncSummary.usersWithoutProfile}</div>
              <div className="text-sm text-muted-foreground">Sem Perfil no Sistema</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
