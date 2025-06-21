
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useContas } from '@/hooks/useContas'
import { TrendingDown, TrendingUp, AlertTriangle, CheckCircle, DollarSign } from 'lucide-react'
import { formatCurrency } from '@/utils/currency'
import { Badge } from '@/components/ui/badge'

export function ContasPainel() {
  const { stats, contas, loading } = useContas()

  if (loading) {
    return (
      <div className="p-3 sm:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const contasVencendoEm7Dias = contas.filter(conta => {
    const hoje = new Date()
    const dataVencimento = new Date(conta.data_vencimento)
    const diferenca = (dataVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
    return diferenca <= 7 && diferenca >= 0 && conta.status !== 'pago' && conta.status !== 'cancelado'
  })

  const contasVencidas = contas.filter(conta => {
    const hoje = new Date()
    const dataVencimento = new Date(conta.data_vencimento)
    return dataVencimento < hoje && conta.status !== 'pago' && conta.status !== 'cancelado'
  })

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Painel de Controle</h1>
        <p className="text-sm text-muted-foreground">Visão geral das suas contas a pagar e receber</p>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">A Pagar</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-red-600">
              {formatCurrency(stats.totalAPagar)}
            </div>
            <p className="text-xs text-muted-foreground">Total pendente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">A Receber</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalAReceber)}
            </div>
            <p className="text-xs text-muted-foreground">Total pendente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Vencidas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-orange-600">
              {formatCurrency(stats.totalVencidas)}
            </div>
            <p className="text-xs text-muted-foreground">Em atraso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Pagas no Mês</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-blue-600">
              {formatCurrency(stats.totalPagasNoMes)}
            </div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>

        <Card className="col-span-2 md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Saldo Projetado</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-lg sm:text-2xl font-bold ${stats.saldoProjetado >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(stats.saldoProjetado)}
            </div>
            <p className="text-xs text-muted-foreground">Projeção</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
              Vencendo em 7 dias ({contasVencendoEm7Dias.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {contasVencendoEm7Dias.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhuma conta vencendo nos próximos 7 dias</p>
            ) : (
              contasVencendoEm7Dias.slice(0, 5).map((conta) => (
                <div key={conta.id} className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{conta.descricao}</p>
                    <p className="text-xs text-muted-foreground">
                      Vencimento: {new Date(conta.data_vencimento).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-medium text-sm">{formatCurrency(conta.valor - conta.valor_pago)}</p>
                    <Badge variant={conta.tipo === 'pagar' ? 'destructive' : 'default'} className="text-xs">
                      {conta.tipo === 'pagar' ? 'A Pagar' : 'A Receber'}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
              Contas Vencidas ({contasVencidas.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {contasVencidas.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhuma conta vencida</p>
            ) : (
              contasVencidas.slice(0, 5).map((conta) => (
                <div key={conta.id} className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{conta.descricao}</p>
                    <p className="text-xs text-red-600">
                      Venceu em: {new Date(conta.data_vencimento).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-medium text-sm">{formatCurrency(conta.valor - conta.valor_pago)}</p>
                    <Badge variant={conta.tipo === 'pagar' ? 'destructive' : 'default'} className="text-xs">
                      {conta.tipo === 'pagar' ? 'A Pagar' : 'A Receber'}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
