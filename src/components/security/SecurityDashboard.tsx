
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, AlertTriangle, Activity, Users } from 'lucide-react'
import { SecurityMonitor } from '@/lib/securityMonitoring'
import { useAuth } from '@/hooks/useAuth'

interface SecurityMetrics {
  totalSuspiciousActivities: number
  blockedUsers: number
  recentAttempts: number
  topThreats: string[]
}

export function SecurityDashboard() {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalSuspiciousActivities: 0,
    blockedUsers: 0,
    recentAttempts: 0,
    topThreats: []
  })
  const [isUserBlocked, setIsUserBlocked] = useState(false)

  useEffect(() => {
    if (user?.id) {
      const userMetrics = SecurityMonitor.getSecurityMetrics(user.id)
      setMetrics(userMetrics)
      setIsUserBlocked(SecurityMonitor.isUserBlocked(user.id))
    }
  }, [user?.id])

  const getSeverityColor = (attempts: number) => {
    if (attempts === 0) return 'bg-green-500'
    if (attempts < 3) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getSeverityText = (attempts: number) => {
    if (attempts === 0) return 'Seguro'
    if (attempts < 3) return 'Atenção'
    return 'Crítico'
  }

  if (!user) {
    return (
      <div className="p-6">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Você precisa estar logado para visualizar o dashboard de segurança.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Dashboard de Segurança
        </h2>
        <Badge variant={isUserBlocked ? "destructive" : "secondary"}>
          {isUserBlocked ? "Conta Bloqueada" : "Conta Ativa"}
        </Badge>
      </div>

      {isUserBlocked && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Sua conta foi temporariamente bloqueada devido a atividades suspeitas. 
            Entre em contato com o suporte se acredita que isso seja um erro.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Status de Segurança
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className={`h-3 w-3 rounded-full ${getSeverityColor(metrics.totalSuspiciousActivities)}`} />
              <span className="text-2xl font-bold">
                {getSeverityText(metrics.totalSuspiciousActivities)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Baseado em atividades detectadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tentativas Suspeitas
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalSuspiciousActivities}</div>
            <p className="text-xs text-muted-foreground">
              Total de tentativas detectadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Atividade Recente
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.recentAttempts}</div>
            <p className="text-xs text-muted-foreground">
              Últimas 24 horas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Usuários Bloqueados
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.blockedUsers}</div>
            <p className="text-xs text-muted-foreground">
              Contas com restrições
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monitoramento em Tempo Real</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Sistema de Detecção</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Ativo
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Logs de Segurança</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Funcionando
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Rate Limiting</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Ativo
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Validação de Entrada</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Ativo
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
