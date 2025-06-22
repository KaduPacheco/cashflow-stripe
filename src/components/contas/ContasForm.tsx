
import { useState } from 'react'
import { useContas } from '@/hooks/useContas'
import { useClientesFornecedores } from '@/hooks/useClientesFornecedores'
import { FormBasicInfo } from './FormBasicInfo'
import { FormClassification } from './FormClassification'
import { FormScheduling } from './FormScheduling'
import { FormSpecialOptions } from './FormSpecialOptions'
import { FormActions } from './FormActions'
import { X } from 'lucide-react'

interface ContasFormProps {
  tipo: 'pagar' | 'receber'
  onSuccess: () => void
  onClose?: () => void
}

export function ContasForm({ tipo, onSuccess, onClose }: ContasFormProps) {
  const { createConta } = useContas()
  const { fetchClientesFornecedores } = useClientesFornecedores()
  
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
          <FormBasicInfo
            descricao={formData.descricao}
            valor={formData.valor}
            onDescricaoChange={(value) => handleChange('descricao', value)}
            onValorChange={(value) => handleChange('valor', value)}
          />

          <FormClassification
            tipo={tipo}
            categoryId={formData.category_id}
            onCategoryChange={(value) => handleChange('category_id', value)}
          />

          <FormScheduling
            dataVencimento={formData.data_vencimento}
            onDataVencimentoChange={(value) => handleChange('data_vencimento', value)}
          />

          <FormSpecialOptions
            recorrente={formData.recorrente}
            recorrencia={formData.recorrencia}
            parcelado={formData.parcelado}
            onRecorrenteChange={(checked) => handleChange('recorrente', checked)}
            onRecorrenciaChange={(value) => handleChange('recorrencia', value)}
            onParceladoChange={(checked) => handleChange('parcelado', checked)}
          />

          <FormActions
            loading={loading}
            onCancel={onClose}
          />
        </form>
      </div>
    </div>
  )
}
