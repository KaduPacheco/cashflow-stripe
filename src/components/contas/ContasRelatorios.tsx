
import { useState } from 'react'
import { useContas } from '@/hooks/useContas'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/utils/currency'
import { FileText, Download, Calendar } from 'lucide-react'
import type { ContasFilters } from '@/types/contas'

export function ContasRelatorios() {
  const { contas, fetchContas } = useContas()
  const [filtros, setFiltros] = useState<ContasFilters>({
    tipo: undefined,
    data_inicio: '',
    data_fim: '',
    status: ''
  })

  const [relatorioGerado, setRelatorioGerado] = useState(false)

  const gerarRelatorio = async () => {
    await fetchContas(filtros)
    setRelatorioGerado(true)
  }

  const exportarPDF = () => {
    // Implementar exportação PDF
    console.log('Exportar PDF')
  }

  const contasFiltradas = contas.filter(conta => {
    if (filtros.tipo && conta.tipo !== filtros.tipo) return false
    if (filtros.status && filtros.status !== 'all' && conta.status !== filtros.status) return false
    if (filtros.data_inicio && conta.data_vencimento < filtros.data_inicio) return false
    if (filtros.data_fim && conta.data_vencimento > filtros.data_fim) return false
    return true
  })

  const totalPagar = contasFiltradas
    .filter(c => c.tipo === 'pagar')
    .reduce((sum, c) => sum + (c.valor - c.valor_pago), 0)

  const totalReceber = contasFiltradas
    .filter(c => c.tipo === 'receber')
    .reduce((sum, c) => sum + (c.valor - c.valor_pago), 0)

  const totalPago = contasFiltradas
    .reduce((sum, c) => sum + c.valor_pago, 0)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-400">Relatórios</h1>
        <p className="text-muted-foreground">Gere relatórios detalhados das suas contas</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Filtros do Relatório
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={filtros.tipo || 'all'} onValueChange={(value) => setFiltros(prev => ({ ...prev, tipo: value === 'all' ? undefined : value as 'pagar' | 'receber' }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pagar">A Pagar</SelectItem>
                  <SelectItem value="receber">A Receber</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={filtros.status || 'all'} onValueChange={(value) => setFiltros(prev => ({ ...prev, status: value === 'all' ? '' : value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="vencido">Vencido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="data_inicio">Data Início</Label>
              <Input
                id="data_inicio"
                type="date"
                value={filtros.data_inicio || ''}
                onChange={(e) => setFiltros(prev => ({ ...prev, data_inicio: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="data_fim">Data Fim</Label>
              <Input
                id="data_fim"
                type="date"
                value={filtros.data_fim || ''}
                onChange={(e) => setFiltros(prev => ({ ...prev, data_fim: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={gerarRelatorio}>
              <Calendar className="h-4 w-4 mr-2" />
              Gerar Relatório
            </Button>
            
            {relatorioGerado && (
              <Button variant="outline" onClick={exportarPDF}>
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {relatorioGerado && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(totalPagar)}
                  </div>
                  <p className="text-sm text-muted-foreground">Total a Pagar</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalReceber)}
                  </div>
                  <p className="text-sm text-muted-foreground">Total a Receber</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(totalPago)}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Pago</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detalhamento das Contas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contasFiltradas.map((conta) => (
                  <div key={conta.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{conta.descricao}</span>
                        <Badge variant={conta.tipo === 'pagar' ? 'destructive' : 'default'}>
                          {conta.tipo === 'pagar' ? 'A Pagar' : 'A Receber'}
                        </Badge>
                        <Badge variant="outline">
                          {conta.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Vencimento: {new Date(conta.data_vencimento).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        {formatCurrency(conta.valor - conta.valor_pago)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        de {formatCurrency(conta.valor)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
