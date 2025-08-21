
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, CheckCircle, AlertTriangle, Info } from 'lucide-react'
import { SecurityConfigValidator } from '@/utils/securityConfig'
import { toast } from 'sonner'

interface SecurityStatus {
  isSecure: boolean
  issues: string[]
  recommendations: string[]
}

export function SecurityDashboard() {
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null)
  const [loading, setLoading] = useState(false)

  const runSecurityCheck = async () => {
    setLoading(true)
    try {
      const status = await SecurityConfigValidator.validateSecuritySettings()
      setSecurityStatus(status)
      
      if (status.isSecure) {
        toast.success('Verificação de segurança concluída - Sistema seguro')
      } else {
        toast.warning(`Verificação concluída - ${status.issues.length} problemas encontrados`)
      }
    } catch (error) {
      toast.error('Erro na verificação de segurança')
      console.error('Security check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runSecurityCheck()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Painel de Segurança</h2>
        </div>
        <Button 
          onClick={runSecurityCheck} 
          disabled={loading}
          variant="outline"
        >
          {loading ? 'Verificando...' : 'Verificar Segurança'}
        </Button>
      </div>

      {securityStatus && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {securityStatus.isSecure ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Status: Seguro
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    Status: Atenção Necessária
                  </>
                )}
              </CardTitle>
              <CardDescription>
                Última verificação: {new Date().toLocaleString('pt-BR')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge 
                variant={securityStatus.isSecure ? "default" : "secondary"}
                className="mb-4"
              >
                {securityStatus.isSecure ? 'Sistema Seguro' : `${securityStatus.issues.length} Problemas`}
              </Badge>
            </CardContent>
          </Card>

          {securityStatus.issues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-600">
                  <AlertTriangle className="h-5 w-5" />
                  Problemas Identificados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {securityStatus.issues.map((issue, index) => (
                    <Alert key={index} variant="destructive">
                      <AlertDescription>{issue}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <Info className="h-5 w-5" />
                Recomendações de Segurança
              </CardTitle>
              <CardDescription>
                Configurações recomendadas para melhorar a segurança
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {securityStatus.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                    <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-blue-700">{recommendation}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Manual de Configuração Supabase</CardTitle>
              <CardDescription>
                Passos para implementar as melhorias de segurança
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold mb-2">1. Proteção contra Senhas Vazadas</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Navegue até: Dashboard Supabase → Authentication → Settings
                  </p>
                  <p className="text-sm">
                    Ative "Breach password protection" para prevenir uso de senhas comprometidas
                  </p>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold mb-2">2. Configuração de OTP</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Acesse: Dashboard Supabase → Authentication → Settings
                  </p>
                  <p className="text-sm">
                    Reduza o tempo de expiração do OTP para 10 minutos (600 segundos)
                  </p>
                </div>

                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-semibold mb-2">3. Revisão de Extensões</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Navegue até: Dashboard Supabase → SQL Editor
                  </p>
                  <p className="text-sm">
                    Audite extensões no schema público e mova as não essenciais
                  </p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold mb-2">4. URLs de Redirecionamento</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Acesse: Dashboard Supabase → Authentication → URL Configuration
                  </p>
                  <p className="text-sm">
                    Configure Site URL e Redirect URLs corretamente para seu domínio
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
