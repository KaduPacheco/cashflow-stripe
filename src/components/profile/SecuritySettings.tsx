
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shield, Key, Clock, Eye, AlertTriangle } from 'lucide-react'
import { SecurityDashboard } from '@/components/security/SecurityDashboard'
import { useSecurityMonitor } from '@/hooks/useSecurityMonitor'
import { toast } from 'sonner'

export function SecuritySettings() {
  const { logSecurityEvent, securityEvents } = useSecurityMonitor()

  const handleSecuritySettingChange = async (setting: string, enabled: boolean) => {
    await logSecurityEvent('config_change', {
      setting,
      enabled,
      changedAt: new Date().toISOString()
    })
    
    toast.success(`Configuração ${setting} ${enabled ? 'ativada' : 'desativada'}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Configurações de Segurança</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Autenticação
            </CardTitle>
            <CardDescription>
              Configurações de login e senha
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="two-factor" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Autenticação de dois fatores
              </Label>
              <Switch 
                id="two-factor" 
                onCheckedChange={(checked) => 
                  handleSecuritySettingChange('two_factor_auth', checked)
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="breach-protection" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Proteção contra senhas vazadas
              </Label>
              <Badge variant="outline">Configurar no Supabase</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Sessão
            </CardTitle>
            <CardDescription>
              Controle de tempo de sessão
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-logout" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Logout automático
              </Label>
              <Switch 
                id="auto-logout" 
                defaultChecked
                onCheckedChange={(checked) => 
                  handleSecuritySettingChange('auto_logout', checked)
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="session-monitoring" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Monitoramento de sessão
              </Label>
              <Switch 
                id="session-monitoring" 
                defaultChecked
                onCheckedChange={(checked) => 
                  handleSecuritySettingChange('session_monitoring', checked)
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Eventos de Segurança Recentes</CardTitle>
          <CardDescription>
            Últimas atividades relacionadas à segurança
          </CardDescription>
        </CardHeader>
        <CardContent>
          {securityEvents.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {securityEvents.slice(0, 10).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{event.type}</Badge>
                    <span className="text-sm">
                      {event.timestamp.toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhum evento de segurança registrado recentemente
            </p>
          )}
        </CardContent>
      </Card>

      <SecurityDashboard />
    </div>
  )
}
