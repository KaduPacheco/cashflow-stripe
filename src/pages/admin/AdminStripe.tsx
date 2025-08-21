
import { StripeSyncButton } from '@/components/admin/StripeSyncButton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, ExternalLink } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

export default function AdminStripe() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Administração Stripe</h1>
        <p className="text-muted-foreground">
          Gerencie sincronização e configurações do Stripe
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Importante:</strong> Certifique-se de que o webhook do Stripe está configurado para:
          <br />
          <code className="bg-muted px-2 py-1 rounded text-sm">
            https://csvkgokkvbtojjkitodc.supabase.co/functions/v1/stripe-webhook
          </code>
          <br />
          Com os eventos: checkout.session.completed, customer.subscription.created, customer.subscription.updated, invoice.payment_succeeded
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sincronização de Clientes</CardTitle>
            <CardDescription>
              Sincroniza todos os clientes e assinaturas do Stripe com o banco de dados.
              Use esta função para corrigir dados de clientes que assinaram via link direto.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StripeSyncButton />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Links Úteis</CardTitle>
            <CardDescription>
              Acesso rápido às configurações do Stripe
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => window.open('https://dashboard.stripe.com/webhooks', '_blank')}
            >
              Configurar Webhooks
              <ExternalLink className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => window.open('https://dashboard.stripe.com/customers', '_blank')}
            >
              Ver Clientes no Stripe
              <ExternalLink className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => window.open('https://dashboard.stripe.com/subscriptions', '_blank')}
            >
              Ver Assinaturas no Stripe
              <ExternalLink className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instruções de Configuração</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">1. Configurar Webhook no Stripe</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Acesse o dashboard do Stripe e configure o webhook endpoint:
              </p>
              <code className="block bg-muted p-2 rounded text-sm">
                https://csvkgokkvbtojjkitodc.supabase.co/functions/v1/stripe-webhook
              </code>
            </div>

            <div>
              <h4 className="font-semibold mb-2">2. Eventos Necessários</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• checkout.session.completed</li>
                <li>• customer.subscription.created</li>
                <li>• customer.subscription.updated</li>
                <li>• customer.subscription.deleted</li>
                <li>• invoice.payment_succeeded</li>
                <li>• invoice.payment_failed</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">3. Webhook Secret</h4>
              <p className="text-sm text-muted-foreground">
                Copie o webhook secret do Stripe e configure nas edge function secrets como STRIPE_WEBHOOK_SECRET
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
