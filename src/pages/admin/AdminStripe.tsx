
import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { StripeSyncButton } from '@/components/admin/StripeSyncButton'
import { StripeConfigStatus } from '@/components/admin/StripeConfigStatus'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, Settings, Database, CreditCard, RefreshCw } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

interface SubscriberStats {
  total: number
  active: number
  premium: number
  vip: number
  withoutProfile: number
}

export default function AdminStripe() {
  const [stats, setStats] = useState<SubscriberStats | null>(null)
  const [loading, setLoading] = useState(true)

  const loadStats = async () => {
    try {
      setLoading(true)
      
      // Buscar estatísticas dos subscribers
      const { data: subscribers, error } = await supabase
        .from('subscribers')
        .select('*')
      
      if (error) throw error
      
      const stats: SubscriberStats = {
        total: subscribers.length,
        active: subscribers.filter(s => s.subscribed).length,
        premium: subscribers.filter(s => s.subscription_tier === 'Premium').length,
        vip: subscribers.filter(s => s.subscription_tier === 'VIP').length,
        withoutProfile: subscribers.filter(s => !s.user_id).length,
      }
      
      setStats(stats)
    } catch (error: any) {
      console.error('Erro ao carregar estatísticas:', error)
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  const webhookUrl = "https://csvkgokkvbtojjkitodc.supabase.co/functions/v1/stripe-webhook"
  const stripeWebhookEvents = [
    "checkout.session.completed",
    "customer.subscription.created", 
    "customer.subscription.updated",
    "customer.subscription.deleted",
    "invoice.payment_succeeded",
    "invoice.payment_failed"
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Gestão Stripe</h1>
            <p className="text-muted-foreground">
              Configuração e sincronização com o Stripe
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={loadStats}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {/* Status da Configuração */}
        <StripeConfigStatus />

        {/* Estatísticas dos Subscribers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '-' : stats?.total || 0}</div>
              <p className="text-xs text-muted-foreground">Registros na base</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
              <CreditCard className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{loading ? '-' : stats?.active || 0}</div>
              <p className="text-xs text-muted-foreground">Pagando atualmente</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Premium</CardTitle>
              <Badge variant="secondary">P</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '-' : stats?.premium || 0}</div>
              <p className="text-xs text-muted-foreground">Tier Premium</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">VIP</CardTitle>
              <Badge variant="default">V</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '-' : stats?.vip || 0}</div>
              <p className="text-xs text-muted-foreground">Tier VIP</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sem Perfil</CardTitle>
              <Badge variant="outline">!</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{loading ? '-' : stats?.withoutProfile || 0}</div>
              <p className="text-xs text-muted-foreground">Não logaram ainda</p>
            </CardContent>
          </Card>
        </div>

        {/* Sincronização */}
        <StripeSyncButton />

        {/* Configuração do Webhook */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuração do Webhook Stripe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium mb-2 text-blue-800">⚠️ Configuração Importante</h4>
              <p className="text-sm text-blue-700 mb-3">
                Para que as assinaturas sejam processadas automaticamente, você precisa configurar 
                o webhook no Stripe Dashboard.
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">URL do Webhook:</h4>
              <div className="flex items-center gap-2">
                <code className="bg-muted px-2 py-1 rounded text-sm font-mono flex-1">
                  {webhookUrl}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigator.clipboard.writeText(webhookUrl)}
                >
                  Copiar
                </Button>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Eventos necessários:</h4>
              <div className="flex flex-wrap gap-2">
                {stripeWebhookEvents.map(event => (
                  <Badge key={event} variant="secondary" className="text-xs">
                    {event}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => window.open('https://dashboard.stripe.com/webhooks', '_blank')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Configurar no Stripe
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open('https://csvkgokkvbtojjkitodc.supabase.co/project/csvkgokkvbtojjkitodc/settings/functions', '_blank')}
              >
                <Settings className="mr-2 h-4 w-4" />
                Secrets Supabase
              </Button>
            </div>

            <div className="text-sm text-muted-foreground space-y-2">
              <p><strong>Passos para configurar:</strong></p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Acesse o <a href="https://dashboard.stripe.com/webhooks" target="_blank" className="text-blue-600 underline">Dashboard do Stripe</a></li>
                <li>Clique em "Add endpoint" ou "Adicionar endpoint"</li>
                <li>Cole a URL do webhook: <code className="bg-muted px-1 rounded">{webhookUrl}</code></li>
                <li>Selecione todos os eventos listados acima</li>
                <li>Salve o webhook e copie o "Signing secret"</li>
                <li>Adicione o secret como <code className="bg-muted px-1 rounded">STRIPE_WEBHOOK_SECRET</code> no Supabase</li>
                <li>Execute a sincronização manual para processar assinaturas existentes</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
