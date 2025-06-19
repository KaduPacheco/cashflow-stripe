
import { useState } from 'react'
import { useContas } from '@/hooks/useContas'
import { useCategories } from '@/hooks/useCategories'
import { useClientesFornecedores } from '@/hooks/useClientesFornecedores'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'

interface ContasFormProps {
  tipo: 'pagar' | 'receber'
  onSuccess: () => void
}

export function ContasForm({ tipo, onSuccess }: ContasFormProps) {
  const { createConta } = useContas()
  const { categories } = useCategories()
  const { clientesFornecedores } = useClientesFornecedores()
  
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    data_vencimento: '',
    category_id: '',
    cliente_fornecedor_id: '',
    observacoes: '',
    numero_documento: ''
  })
  
  const [loading, setLoading] = useState(false)

  const tipoContato = tipo === 'pagar' ? 'fornecedor' : 'cliente'
  const clientesFornecedoresFiltrados = clientesFornecedores.filter(cf => 
    cf.tipo === tipoContato || cf.tipo === 'ambos'
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.descricao || !formData.valor || !formData.data_vencimento) {
      return
    }

    setLoading(true)

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
      user_id: '' // Will be set by the hook
    }

    const result = await createConta(contaData)
    
    if (result) {
      onSuccess()
    }
    
    setLoading(false)
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="descricao">Descrição *</Label>
            <Input
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleChange('descricao', e.target.value)}
              placeholder="Digite a descrição da conta"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="valor">Valor *</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                value={formData.valor}
                onChange={(e) => handleChange('valor', e.target.value)}
                placeholder="0,00"
                required
              />
            </div>

            <div>
              <Label htmlFor="data_vencimento">Data de Vencimento *</Label>
              <Input
                id="data_vencimento"
                type="date"
                value={formData.data_vencimento}
                onChange={(e) => handleChange('data_vencimento', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="categoria">Categoria</Label>
              <Select value={formData.category_id} onValueChange={(value) => handleChange('category_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
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

            <div>
              <Label htmlFor="cliente_fornecedor">{tipo === 'pagar' ? 'Fornecedor' : 'Cliente'}</Label>
              <Select value={formData.cliente_fornecedor_id} onValueChange={(value) => handleChange('cliente_fornecedor_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={`Selecione um ${tipo === 'pagar' ? 'fornecedor' : 'cliente'}`} />
                </SelectTrigger>
                <SelectContent>
                  {clientesFornecedoresFiltrados.map((cf) => (
                    <SelectItem key={cf.id} value={cf.id}>
                      {cf.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="numero_documento">Número do Documento</Label>
            <Input
              id="numero_documento"
              value={formData.numero_documento}
              onChange={(e) => handleChange('numero_documento', e.target.value)}
              placeholder="Ex: NF-001, Boleto 123..."
            />
          </div>

          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleChange('observacoes', e.target.value)}
              placeholder="Observações adicionais..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Conta'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
