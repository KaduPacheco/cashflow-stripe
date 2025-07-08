
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Bug,
  Package,
  Clock
} from 'lucide-react'
import { VulnerabilityScanner } from '@/lib/vulnerabilityScanner'
import { DependencyScanner } from '@/lib/dependencyScanner'
import { toast } from '@/hooks/use-toast'

interface SecurityReport {
  vulnerabilityScan: {
    passed: number
    failed: number
    total: number
    results: Array<{
      name: string
      passed: boolean
      severity: string
      details: string
    }>
  } | null
  dependencyReport: {
    timestamp: string
    vulnerabilityCount: number
    dependencyCount: number
    recommendations: string[]
    status: 'SECURE' | 'NEEDS_ATTENTION' | 'CRITICAL'
  } | null
  lastScan: Date | null
  isScanning: boolean
}

export function SecurityReportCard() {
  const [report, setReport] = useState<SecurityReport>({
    vulnerabilityScan: null,
    dependencyReport: null,
    lastScan: null,
    isScanning: false
  })

  const runFullSecurityScan = async () => {
    setReport(prev => ({ ...prev, isScanning: true }))
    
    try {
      toast({
        title: "Iniciando scan de segurança",
        description: "Executando testes de vulnerabilidade e dependências...",
      })

      const [vulnScan, depReport] = await Promise.all([
        VulnerabilityScanner.runSecurityScan(),
        DependencyScanner.generateSecurityReport()
      ])

      setReport({
        vulnerabilityScan: vulnScan,
        dependencyReport: depReport,
        lastScan: new Date(),
        isScanning: false
      })

      // Executar testes automatizados em background
      VulnerabilityScanner.runAutomatedTests()

      toast({
        title: "Scan de segurança concluído",
        description: `${vulnScan.passed}/${vulnScan.total} testes passaram. ${depReport.vulnerabilityCount} vulnerabilidades em dependências.`,
      })

    } catch (error) {
      setReport(prev => ({ ...prev, isScanning: false }))
      toast({
        title: "Erro no scan de segurança",
        description: "Não foi possível executar o scan completo.",
        variant: "destructive"
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SECURE': return 'bg-green-500'
      case 'NEEDS_ATTENTION': return 'bg-yellow-500'
      case 'CRITICAL': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getSeverityBadge = (severity: string) => {
    const colors = {
      'LOW': 'secondary',
      'MEDIUM': 'outline',
      'HIGH': 'destructive',
      'CRITICAL': 'destructive'
    } as const
    
    return <Badge variant={colors[severity as keyof typeof colors] || 'secondary'}>{severity}</Badge>
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Relatório de Segurança
          </CardTitle>
          <Button 
            onClick={runFullSecurityScan} 
            disabled={report.isScanning}
            size="sm"
          >
            {report.isScanning ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Bug className="h-4 w-4 mr-2" />
            )}
            {report.isScanning ? 'Escaneando...' : 'Executar Scan'}
          </Button>
        </div>
        {report.lastScan && (
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Último scan: {report.lastScan.toLocaleString('pt-BR')}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Geral */}
        {report.dependencyReport && (
          <Alert className={`border-l-4 ${
            report.dependencyReport.status === 'SECURE' ? 'border-green-500' : 
            report.dependencyReport.status === 'CRITICAL' ? 'border-red-500' : 'border-yellow-500'
          }`}>
            <div className={`h-3 w-3 rounded-full ${getStatusColor(report.dependencyReport.status)}`} />
            <AlertDescription>
              Status: <strong>{report.dependencyReport.status}</strong>
              {report.dependencyReport.vulnerabilityCount > 0 && 
                ` - ${report.dependencyReport.vulnerabilityCount} vulnerabilidade(s) encontrada(s)`
              }
            </AlertDescription>
          </Alert>
        )}

        {/* Testes de Vulnerabilidade */}
        {report.vulnerabilityScan && (
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Bug className="h-4 w-4" />
              Testes de Vulnerabilidade
            </h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-600">
                  {report.vulnerabilityScan.passed}
                </div>
                <div className="text-sm text-muted-foreground">Passaram</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-red-600">
                  {report.vulnerabilityScan.failed}
                </div>
                <div className="text-sm text-muted-foreground">Falharam</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold">
                  {report.vulnerabilityScan.total}
                </div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
            </div>
            
            <div className="space-y-2">
              {report.vulnerabilityScan.results.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    {result.passed ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm font-medium">{result.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getSeverityBadge(result.severity)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Relatório de Dependências */}
        {report.dependencyReport && (
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Package className="h-4 w-4" />
              Análise de Dependências
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">{report.dependencyReport.dependencyCount}</div>
                  <div className="text-sm text-muted-foreground">Dependências Analisadas</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-red-600">
                    {report.dependencyReport.vulnerabilityCount}
                  </div>
                  <div className="text-sm text-muted-foreground">Vulnerabilidades</div>
                </CardContent>
              </Card>
            </div>
            
            {report.dependencyReport.recommendations.length > 0 && (
              <div className="space-y-2">
                <h5 className="font-medium">Recomendações:</h5>
                <ul className="text-sm space-y-1">
                  {report.dependencyReport.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {!report.vulnerabilityScan && !report.dependencyReport && !report.isScanning && (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Execute um scan para visualizar o relatório de segurança</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
