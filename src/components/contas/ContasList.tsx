
import { useState } from 'react'
import { useContas } from '@/hooks/useContas'
import { formatCurrency } from '@/utils/currency'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, Edit, Trash2, DollarSign, Repeat, StopCircle } from 'lucide-react'
import { ContasForm } from './ContasForm'
import type { ContaPagarReceber } from '@/types/contas'

interface ContasListProps {
  contas: ContaPagarReceber[]
  loading: boolean
  tipo: 'pagar' | 'receber'
  onUpdate: () => void
}

export function ContasList({ contas, loading, tipo, onUpdate }: ContasListProps) {
  const { deleteConta, pagarConta, pararRecorrencia, gerarRecorrencia } = useContas()
  const [pagamentoDialog, setPagamentoDialog] = useState(false)
  const [editDialog, setEditDialog] = useState(false)
  const [contaSelecionada, setContaSelecionada] = useState<ContaPagarReceber | null>(null)
  const [valorPagamento, setValorPagamento] = useState('')
  const [dataPagamento, setDataPagamento] = useState(new Date().toISOString().split('T')[0])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago': return 'default'
      case 'pendente': return 'secondary'
      case 'parcialmente_pago': return 'outline'
      case 'vencido': return 'destructive'
      case 'cancelado': return 'secondary'
      default: return 'secondary'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pago': return 'Pago'
      case 'pendente': return 'Pendente'
      case 'parcialmente_pago': return 'Parcial'
      case 'vencido': return 'Vencido'
      case 'cancelado': return 'Cancelado'
      default: return status
    }
  }

  const getRecorrenciaLabel = (recorrencia?: string) => {
    switch (recorrencia) {
      case 'mensal': return 'Mensal'
      case 'trimestral': return 'Trimestral'
      case 'semestral': return 'Semestral'
      case 'anual': return 'Anual'
      default: return null
    }
  }

  const handlePagamento = async () => {
    if (!contaSelecionada || !valorPagamento) return

    const valor = parseFloat(valorPagamento)
    const resultado = await pagarConta(contaSelecionada.id, valor, dataPagamento)
    
    // Se o pagamento foi bem-sucedido e a conta é recorrente, gerar próxima ocorrência
    if (resultado && contaSelecionada.recorrencia && contaSelecionada.recorrencia !== 'unica') {
      const valorTotal = contaSelecionada.valor
      const valorJaPago = contaSelecionada.valor_pago + valor
      
      // Se a conta foi completamente paga, gerar próxima recorrência
      if (valorJaPago >= valorTotal) {
        await gerarRecorrencia(contaSelecionada)
      }
    }
    
    setPagamentoDialog(false)
    setContaSelecionada(null)
    setValorPagamento('')
    onUpdate()
  }

  const handleEdit = (conta: ContaPagarReceber) => {
    setContaSelecionada(conta)
    setEditDialog(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta conta?')) {
      await deleteConta(id)
      onUpdate()
    }
  }

  const handlePararRecorrencia = async (id: string) => {
    if (confirm('Tem certeza que deseja parar a recorrência desta conta?')) {
      await pararRecorrencia(id)
      onUpdate()
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded animate-pulse"></div>
        ))}
      </div>
    )
  }

  if (contas.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Nenhuma conta encontrada</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {contas.map((conta) => (
          <Card key={conta.id}>
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
                    {formatCurrency(conta.valor - conta.valor_pago)}
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
                      onClick={() => {
                        setContaSelecionada(conta)
                        setValorPagamento((conta.valor - conta.valor_pago).toString())
                        setPagamentoDialog(true)
                      }}
                    >
                      <DollarSign className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {conta.recorrencia && conta.recorrencia !== 'unica' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handlePararRecorrencia(conta.id)}
                      title="Parar recorrência"
                    >
                      <StopCircle className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEdit(conta)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDelete(conta.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
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

      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Conta</DialogTitle>
          </DialogHeader>
          {contaSelecionada && (
            <ContasForm 
              tipo={contaSelecionada.tipo} 
              conta={contaSelecionada}
              onSuccess={() => {
                setEditDialog(false)
                setContaSelecionada(null)
                onUpdate()
              }} 
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
