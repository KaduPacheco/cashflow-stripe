
import { useState, useEffect } from 'react'
import { useContas } from '@/hooks/useContas'
import { useCategories } from '@/hooks/useCategories'
import { useClientesFornecedores } from '@/hooks/useClientesFornecedores'
import { ClienteFornecedorQuickAdd } from './ClienteFornecedorQuickAdd'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { X, Calendar, CreditCard, Tag, Settings } from 'lucide-react'

interface ContasFormProps {
  tipo: 'pagar' | 'receber'
  onSuccess: () => void
  onClose?: () => void
}

export function ContasForm({ tipo, onSuccess, onClose }: ContasFormProps) {
  const { createConta } = useContas()
  const { categories } = useCategories()
  const { clientesFornecedores, fetchClientesFornecedores } = useClientesFornecedores()
  
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    data_vencimento: '',
    category_id: '',
    cliente_fornecedor_id: '',
    observacoes: '',
    numero_documento: '',
    recorrencia: 'unica',
    recorrente: false,
    parcelado: false
  })
  
  const [loading, setLoading] = useState(false)

  const tipoContato = tipo === 'pagar' ? 'fornecedor' : 'cliente'
  const clientesFornecedoresFiltrados = clientesFornecedores.filter(cf => 
    cf.tipo === tipoContato || cf.tipo === 'ambos'
  )

  const calcularProximaRecorrencia = (dataVencimento: string, recorrencia: string): string | undefined => {
    if (recorrencia === 'unica') return undefined
    
    const data = new Date(dataVencimento)
    
    switch (recorrencia) {
      case 'mensal':
        data.setMonth(data.getMonth() + 1)
        break
      case 'trimestral':
        data.setMonth(data.getMonth() + 3)
        break
      case 'semestral':
        data.setMonth(data.getMonth() + 6)
        break
      case 'anual':
        data.setFullYear(data.getFullYear() + 1)
        break
    }
    
    return data.toISOString().split('T')[0]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.descricao || !formData.valor || !formData.data_vencimento) {
      return
    }

    setLoading(true)

    const dataProximaRecorrencia = formData.recorrente ? calcularProximaRecorrencia(
      formData.data_vencimento, 
      formData.recorrencia
    ) : undefined

    const contaData = {
      tipo,
      descricao: formData.descricao,
      valor: parseFloat(formData.valor),
      data_vencimento: formData.data_vencimento,
      valor_pago: 0,
      status: 'pendente' as const,
      category_id: formData.category_id || undefined,
      cliente_fornecedor_id: formData.cliente_fornecedor_id || undefined,
      observacoes: formData.observacoes || undefined,
      numero_documento: formData.numero_documento || undefined,
      recorrencia: formData.recorrente ? (formData.recorrencia as 'unica' | 'mensal' | 'trimestral' | 'semestral' | 'anual') : 'unica',
      data_proxima_recorrencia: dataProximaRecorrencia,
      user_id: ''
    }

    const result = await createConta(contaData)
    
    if (result) {
      onSuccess()
    }
    
    setLoading(false)
  }

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleClienteFornecedorAdded = (novoId: string) => {
    fetchClientesFornecedores()
    setFormData(prev => ({ ...prev, cliente_fornecedor_id: novoId }))
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-500 rounded-sm flex items-center justify-center">
            <span className="text-white text-sm font-bold">+</span>
          </div>
          <h2 className="text-lg font-semibold">Novo Lançamento Futuro</h2>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="p-4">
        <p className="text-sm text-gray-600 mb-6">
          Registre um lançamento previsto para o futuro.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Informações Básicas
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-4 bg-orange-400 rounded"></div>
                  <Label className="text-sm font-medium">Descrição</Label>
                </div>
                <Input
                  value={formData.descricao}
                  onChange={(e) => handleChange('descricao', e.target.value)}
                  placeholder="Ex: IPTU, Salário, Energia..."
                  className="border-green-200 focus:border-green-400"
                  required
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-4 bg-orange-400 rounded"></div>
                  <Label className="text-sm font-medium">Valor</Label>
                </div>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.valor}
                  onChange={(e) => handleChange('valor', e.target.value)}
                  placeholder="Ex: 1.500,00"
                  className="border-green-200 focus:border-green-400"
                  required
                />
              </div>
            </div>
          </div>

          {/* Classificação */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Classificação
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4 text-blue-500" />
                  <Label className="text-sm font-medium">Tipo</Label>
                </div>
                <Select value={tipo} disabled>
                  <SelectTrigger className="border-green-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receber">A Receber</SelectItem>
                    <SelectItem value="pagar">A Pagar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-4 w-4 text-orange-500" />
                  <Label className="text-sm font-medium">Categoria</Label>
                </div>
                <Select value={formData.category_id} onValueChange={(value) => handleChange('category_id', value)}>
                  <SelectTrigger className="border-green-200">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Agendamento */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Agendamento
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-purple-500" />
                <Label className="text-sm font-medium">Data Prevista</Label>
              </div>
              <Input
                type="date"
                value={formData.data_vencimento}
                onChange={(e) => handleChange('data_vencimento', e.target.value)}
                className="border-green-200 focus:border-green-400"
                required
              />
            </div>
          </div>

          {/* Opções Especiais */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Opções Especiais
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="text-sm font-medium">Lançamento Recorrente</div>
                    <div className="text-xs text-gray-500">Repetir automaticamente a cada período</div>
                  </div>
                </div>
                <Switch
                  checked={formData.recorrente}
                  onCheckedChange={(checked) => handleChange('recorrente', checked)}
                />
              </div>

              {formData.recorrente && (
                <Select value={formData.recorrencia} onValueChange={(value) => handleChange('recorrencia', value)}>
                  <SelectTrigger className="border-green-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensal">Mensal</SelectItem>
                    <SelectItem value="trimestral">Trimestral</SelectItem>
                    <SelectItem value="semestral">Semestral</SelectItem>
                    <SelectItem value="anual">Anual</SelectItem>
                  </SelectContent>
                </Select>
              )}

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="text-sm font-medium">Lançamento Parcelado</div>
                    <div className="text-xs text-gray-500">Dividir em várias parcelas mensais</div>
                  </div>
                </div>
                <Switch
                  checked={formData.parcelado}
                  onCheckedChange={(checked) => handleChange('parcelado', checked)}
                />
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-500 hover:bg-green-600"
            >
              {loading ? 'Salvando...' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
