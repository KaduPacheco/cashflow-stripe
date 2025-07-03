
import { useState, useEffect } from 'react'
import { useContas } from '@/hooks/useContas'
import { toast } from 'sonner'
import type { ContaPagarReceber } from '@/types/contas'

interface ContasFormData {
  descricao: string
  valor: string
  data_vencimento: string
  category_id: string
  cliente_fornecedor_id: string
  observacoes: string
  numero_documento: string
  recorrencia: string
  recorrente: boolean
  parcelado: boolean
  numeroParcelas: number
}

export function useContasFormLogic(
  tipo: 'pagar' | 'receber',
  conta?: ContaPagarReceber,
  onSuccess?: () => void
) {
  const { createConta, updateConta } = useContas()
  
  const [formData, setFormData] = useState<ContasFormData>({
    descricao: '',
    valor: '',
    data_vencimento: '',
    category_id: '',
    cliente_fornecedor_id: '',
    observacoes: '',
    numero_documento: '',
    recorrencia: 'unica',
    recorrente: false,
    parcelado: false,
    numeroParcelas: 2
  })
  
  const [loading, setLoading] = useState(false)

  // Preencher formulário quando estiver editando
  useEffect(() => {
    if (conta) {
      setFormData({
        descricao: conta.descricao || '',
        valor: conta.valor.toString(),
        data_vencimento: conta.data_vencimento || '',
        category_id: conta.category_id || '',
        cliente_fornecedor_id: conta.cliente_fornecedor_id || '',
        observacoes: conta.observacoes || '',
        numero_documento: conta.numero_documento || '',
        recorrencia: conta.recorrencia || 'unica',
        recorrente: conta.recorrencia !== 'unica',
        parcelado: false,
        numeroParcelas: 2
      })
    }
  }, [conta])

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

  const criarParcelas = async (contaBase: any, numeroParcelas: number) => {
    const valorParcela = parseFloat(formData.valor) / numeroParcelas
    const dataBase = new Date(formData.data_vencimento)
    const parcelas = []

    for (let i = 0; i < numeroParcelas; i++) {
      const dataVencimentoParcela = new Date(dataBase)
      dataVencimentoParcela.setMonth(dataBase.getMonth() + i)

      const parcela = {
        ...contaBase,
        descricao: `${formData.descricao} (${i + 1}/${numeroParcelas})`,
        valor: valorParcela,
        data_vencimento: dataVencimentoParcela.toISOString().split('T')[0],
        recorrencia: 'unica' as const,
        data_proxima_recorrencia: undefined
      }

      const resultado = await createConta(parcela)
      if (resultado) {
        parcelas.push(resultado)
      } else {
        toast.error(`Erro ao criar parcela ${i + 1}`)
        return false
      }
    }

    return parcelas.length === numeroParcelas
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.descricao || !formData.valor || !formData.data_vencimento) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    if (formData.parcelado && formData.numeroParcelas < 2) {
      toast.error('O número de parcelas deve ser maior que 1')
      return
    }

    setLoading(true)

    try {
      const dataProximaRecorrencia = formData.recorrente ? calcularProximaRecorrencia(
        formData.data_vencimento, 
        formData.recorrencia
      ) : undefined

      const contaData = {
        tipo,
        descricao: formData.descricao,
        valor: parseFloat(formData.valor),
        data_vencimento: formData.data_vencimento,
        valor_pago: conta?.valor_pago || 0,
        status: conta?.status || 'pendente' as const,
        category_id: formData.category_id || undefined,
        cliente_fornecedor_id: formData.cliente_fornecedor_id || undefined,
        observacoes: formData.observacoes || undefined,
        numero_documento: formData.numero_documento || undefined,
        recorrencia: formData.recorrente ? (formData.recorrencia as 'unica' | 'mensal' | 'trimestral' | 'semestral' | 'anual') : 'unica',
        data_proxima_recorrencia: dataProximaRecorrencia,
        user_id: ''
      }

      if (conta) {
        // Editando conta existente
        const result = await updateConta(conta.id, contaData)
        if (result && onSuccess) {
          onSuccess()
        }
      } else {
        // Criando nova conta
        if (formData.parcelado) {
          // Criar parcelas
          const sucesso = await criarParcelas(contaData, formData.numeroParcelas)
          if (sucesso) {
            toast.success(`${formData.numeroParcelas} parcelas criadas com sucesso!`)
            if (onSuccess) onSuccess()
          }
        } else {
          // Criar conta única
          const result = await createConta(contaData)
          if (result && onSuccess) {
            onSuccess()
          }
        }
      }
    } catch (error) {
      console.error('Erro ao processar conta:', error)
      toast.error('Erro ao processar conta')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return {
    formData,
    loading,
    handleSubmit,
    handleChange
  }
}
