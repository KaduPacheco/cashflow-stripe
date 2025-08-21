
import { DashboardMetricCard } from '@/components/dashboard/DashboardMetricCard'
import { useAdminMetrics } from '@/hooks/useAdminMetrics'
import { StripeSyncButton } from '@/components/admin/StripeSyncButton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink, Users, CreditCard, TrendingUp, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
  const { metrics, loading } = useAdminMetrics()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
          <p className="text-muted-foreground">
            Visão geral do sistema e métricas importantes
          </p>
        </div>
        
        <Button 
          onClick={() => navigate('/admin/stripe')}
          variant="outline"
          className="gap-2"
        >
          <CreditCard className="h-4 w-4" />
          Administrar Stripe
        </Button>
      </div>

      {/* Métricas principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardMetricCard
          title="Total de Usuários"
          value={metrics?.totalUsers || 0}
          description="Usuários cadastrados"
          icon={Users}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
          borderColor="border-blue-200"
          valueColor="text-blue-600"
          isCurrency={false}
        />
        
        <DashboardMetricCard
          title="Assinantes Ativos"
          value={metrics?.activeSubscribers || 0}
          description="Com assinatura ativa"
          icon={CreditCard}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
          borderColor="border-green-200"
          valueColor="text-green-600"
          isCurrency={false}
        />
        
        <DashboardMetricCard
          title="Taxa de Conversão"
          value={((metrics?.activeSubscribers || 0) / (metrics?.totalUsers || 1) * 100)}
          description="Usuários que assinaram (%)"
          icon={TrendingUp}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-100"
          borderColor="border-orange-200"
          valueColor="text-orange-600"
          isCurrency={false}
        />
        
        <DashboardMetricCard
          title="Usuários Premium"
          value={metrics?.premiumUsers || 0}
          description="Tier Premium/VIP"
          icon={AlertCircle}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
          borderColor="border-purple-200"
          valueColor="text-purple-600"
          isCurrency={false}
        />
      </div>

      {/* Sincronização Stripe */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Sincronização Stripe
          </CardTitle>
          <CardDescription>
            Sincronize clientes e assinaturas do Stripe com o banco de dados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StripeSyncButton />
        </CardContent>
      </Card>

      {/* Links úteis */}
      <Card>
        <CardHeader>
          <CardTitle>Links Administrativos</CardTitle>
          <CardDescription>
            Acesso rápido às principais ferramentas
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2">
          <Button 
            variant="outline" 
            className="justify-between"
            onClick={() => navigate('/admin/users')}
          >
            Gerenciar Usuários
            <Users className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            className="justify-between"
            onClick={() => window.open('https://dashboard.stripe.com', '_blank')}
          >
            Dashboard Stripe
            <ExternalLink className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
