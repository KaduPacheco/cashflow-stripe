
import { useState, memo, useCallback, useMemo } from 'react'
import { useContas } from '@/hooks/useContas'
import { formatCurrency } from '@/utils/currency'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, Edit, Trash2, DollarSign, Repeat, StopCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import type { ContaPagarReceber } from '@/types/contas'

interface OptimizedContasListProps {
  contas: ContaPagarReceber[]
  loading: boolean
  tipo: 'pagar' | 'receber'
  onUpdate: () => void
}

const ContaCard = memo(({ 
  conta, 
  onPagamento, 
  onDelete, 
  onPararRecorrencia 
}: { 
  conta: ContaPagarReceber
  onPagamento: (conta: ContaPagarReceber) => void
  onDelete: (id: string) => void
  onPararRecorrencia: (id: string) => void
}) => {
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'pago': return 'default'
      case 'pendente': return 'secondary'
      case 'parcialmente_pago': return 'outline'
      case 'vencido': return 'destructive'
      case 'cancelado': return 'secondary'
      default: return 'secondary'
    }
  }, [])

  const getStatusLabel = useCallback((status: string) => {
    switch (status) {
      case 'pago': return 'Pago'
      case 'pendente': return 'Pendente'
      case 'parcialmente_pago': return 'Parcial'
      case 'vencido': return 'Vencido'
      case 'cancelado': return 'Cancelado'
      default: return status
    }
  }, [])

  const getRecorrenciaLabel = useCallback((recorrencia?: string) => {
    switch (recorrencia) {
      case 'mensal': return 'Mensal'
      case 'trimestral': return 'Trimestral'
      case 'semestral': return 'Semestral'
      case 'anual': return 'Anual'
      default: return null
    }
  }, [])

  const valorRestante = useMemo(() => conta.valor - conta.valor_pago, [conta.valor, conta.valor_pago])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium">{conta.descricao}</h3>
                <Badge variant={getStatusColor(conta.status)}>
                  {getStatusLabel(conta.status)}
                </Badge>
                
                {conta.recorrencia && conta.recorrencia !== 'unica' && (
                  <Badge variant="outline" className="text-blue-600 border-blue-300">
                    <Repeat className="h-3 w-3 mr-1" />
                    {getRecorrenciaLabel(conta.recorrencia)}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Venc: {new Date(conta.data_vencimento).toLocaleDateString('pt-BR')}
                </div>
                
                {conta.clientes_fornecedores && (
                  <span>• {conta.clientes_fornecedores.nome}</span>
                )}
                
                {conta.categorias && (
                  <span>• {conta.categorias.nome}</span>
                )}
                
                {conta.data_proxima_recorrencia && (
                  <span className="text-blue-600">
                    • Próx: {new Date(conta.data_proxima_recorrencia).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right mr-4">
              <div className="font-bold text-lg">
                {formatCurrency(valorRestante)}
              </div>
              <div className="text-sm text-muted-foreground">
                Total: {formatCurrency(conta.valor)}
              </div>
              {conta.valor_pago > 0 && (
                <div className="text-sm text-green-600">
                  Pago: {formatCurrency(conta.valor_pago)}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {conta.status !== 'pago' && conta.status !== 'cancelado' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onPagamento(conta)}
                >
                  <DollarSign className="h-4 w-4" />
                </Button>
              )}
              
              {conta.recorrencia && conta.recorrencia !== 'unica' && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onPararRecorrencia(conta.id)}
                  title="Parar recorrência"
                >
                  <StopCircle className="h-4 w-4" />
                </Button>
              )}
              
              <Button size="sm" variant="outline">
                <Edit className="h-4 w-4" />
              </Button>
              
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onDelete(conta.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
})

ContaCard.displayName = "ContaCard"

export const OptimizedContasList = memo(({ contas, loading, tipo, onUpdate }: OptimizedContasListProps) => {
  const { deleteConta, pagarConta, pararRecorrencia } = useContas()
  const [pagamentoDialog, setPagamentoDialog] = useState(false)
  const [contaSelecionada, setContaSelecionada] = useState<ContaPagarReceber | null>(null)
  const [valorPagamento, setValorPagamento] = useState('')
  const [dataPagamento, setDataPagamento] = useState(new Date().toISOString().split('T')[0])

  const handlePagamento = useCallback(async () => {
    if (!contaSelecionada || !valorPagamento) return

    const valor = parseFloat(valorPagamento)
    await pagarConta(contaSelecionada.id, valor, dataPagamento)
    
    setPagamentoDialog(false)
    setContaSelecionada(null)
    setValorPagamento('')
    onUpdate()
  }, [contaSelecionada, valorPagamento, dataPagamento, pagarConta, onUpdate])

  const handleDelete = useCallback(async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta conta?')) {
      await deleteConta(id)
      onUpdate()
    }
  }, [deleteConta, onUpdate])

  const handlePararRecorrencia = useCallback(async (id: string) => {
    if (confirm('Tem certeza que deseja parar a recorrência desta conta?')) {
      await pararRecorrencia(id)
      onUpdate()
    }
  }, [pararRecorrencia, onUpdate])

  const handleOpenPagamento = useCallback((conta: ContaPagarReceber) => {
    setContaSelecionada(conta)
    setValorPagamento((conta.valor - conta.valor_pago).toString())
    setPagamentoDialog(true)
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div 
            key={i} 
            className="h-24 bg-muted rounded animate-pulse"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
          />
        ))}
      </div>
    )
  }

  if (contas.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <motion.p 
            className="text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            Nenhuma conta encontrada
          </motion.p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {contas.map((conta) => (
          <ContaCard
            key={conta.id}
            conta={conta}
            onPagamento={handleOpenPagamento}
            onDelete={handleDelete}
            onPararRecorrencia={handlePararRecorrencia}
          />
        ))}
      </div>

      <Dialog open={pagamentoDialog} onOpenChange={setPagamentoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Conta</Label>
              <div className="text-sm text-muted-foreground">
                {contaSelecionada?.descricao}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="valor">Valor a Pagar</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  value={valorPagamento}
                  onChange={(e) => setValorPagamento(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="data">Data do Pagamento</Label>
                <Input
                  id="data"
                  type="date"
                  value={dataPagamento}
                  onChange={(e) => setDataPagamento(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setPagamentoDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handlePagamento}>
                Confirmar Pagamento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
})

OptimizedContasList.displayName = "OptimizedContasList"
