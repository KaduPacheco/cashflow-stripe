
import { SecurityDashboard } from '@/components/security/SecurityDashboard'
import { SecurityReportCard } from '@/components/security/SecurityReportCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Activity, AlertTriangle, TrendingUp } from 'lucide-react'

export default function SecurityDashboardPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Central de Segurança
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitoramento completo de segurança e detecção de ameaças
          </p>
        </div>
      </div>

      {/* Cards de Status Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status do Sistema</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Seguro</div>
            <p className="text-xs text-muted-foreground">Todos os sistemas operacionais</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">0</div>
            <p className="text-xs text-muted-foreground">Nenhum alerta crítico</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tendência</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">Estável</div>
            <p className="text-xs text-muted-foreground">Sem anomalias detectadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard Principal */}
      <SecurityDashboard />

      {/* Relatório de Segurança */}
      <SecurityReportCard />

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle>Recursos de Segurança Implementados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Proteções Ativas:</h4>
              <ul className="text-sm space-y-1">
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                  Rate Limiting avançado
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                  Detecção de XSS e SQL Injection
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                  Monitoramento em tempo real
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                  Logs de segurança centralizados
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Testes Automatizados:</h4>
              <ul className="text-sm space-y-1">
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full" />
                  Scan de vulnerabilidades
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full" />
                  Análise de dependências
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full" />
                  Testes de penetração
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full" />
                  Auditoria de código
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
