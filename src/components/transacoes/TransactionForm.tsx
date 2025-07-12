
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { useTransactions } from '@/hooks/useTransactions'
import { TransactionFormBasicInfo } from './form/TransactionFormBasicInfo'
import { TransactionFormClassification } from './form/TransactionFormClassification'
import { TransactionFormScheduling } from './form/TransactionFormScheduling'
import { TransactionFormDetails } from './form/TransactionFormDetails'
import { TransactionFormSpecialOptions } from './form/TransactionFormSpecialOptions'
import { useRecurringLogic } from '@/hooks/useRecurringLogic'
import { Transacao } from '@/types/transaction'

interface TransactionFormProps {
  onSuccess: () => void
  editingTransaction?: Transacao | null
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ 
  onSuccess, 
  editingTransaction 
}) => {
  const { createTransaction, updateTransaction } = useTransactions()
  const [estabelecimento, setEstabelecimento] = useState('')
  const [valor, setValor] = useState('')
  const [tipo, setTipo] = useState<'receita' | 'despesa'>('despesa')
  const [categoryId, setCategoryId] = useState('')
  const [quando, setQuando] = useState(new Date().toISOString().split('T')[0])
  const [detalhes, setDetalhes] = useState('')
  const [loading, setLoading] = useState(false)

  const {
    recorrente,
    recorrencia,
    parcelado,
    numeroParcelas,
    setRecorrente,
    setRecorrencia,
    setParcelado,
    setNumeroParcelas
  } = useRecurringLogic()

  // Load editing data when editingTransaction changes
  useEffect(() => {
    if (editingTransaction) {
      setEstabelecimento(editingTransaction.estabelecimento || '')
      setValor(editingTransaction.valor?.toString() || '')
      setTipo(editingTransaction.tipo as 'receita' | 'despesa' || 'despesa')
      setCategoryId(editingTransaction.category_id || '')
      setQuando(editingTransaction.quando ? editingTransaction.quando.split('T')[0] : new Date().toISOString().split('T')[0])
      setDetalhes(editingTransaction.detalhes || '')
    } else {
      // Reset form for new transaction
      setEstabelecimento('')
      setValor('')
      setTipo('despesa')
      setCategoryId('')
      setQuando(new Date().toISOString().split('T')[0])
      setDetalhes('')
      setRecorrente(false)
      setParcelado(false)
      setNumeroParcelas(2)
    }
  }, [editingTransaction, setRecorrente, setParcelado, setNumeroParcelas])

  const handleTipoChange = (value: string) => {
    setTipo(value as 'receita' | 'despesa')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!estabelecimento || !valor || !categoryId) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const valorNumerico = parseFloat(valor.replace(',', '.'))
      const formData = {
        estabelecimento,
        valor: valorNumerico,
        tipo,
        category_id: categoryId,
        detalhes,
        quando
      }

      if (editingTransaction) {
        // Update existing transaction
        await updateTransaction(editingTransaction.id, formData)
        toast({
          title: "Sucesso!",
          description: "Transação atualizada com sucesso",
        })
      } else {
        // Create new transaction
        if (parcelado && numeroParcelas > 1) {
          // Handle installments for new transactions only
          const valorParcela = valorNumerico / numeroParcelas
          
          for (let i = 0; i < numeroParcelas; i++) {
            const dataTransacao = new Date(quando)
            dataTransacao.setMonth(dataTransacao.getMonth() + i)
            
            await createTransaction({
              estabelecimento: `${estabelecimento} (${i + 1}/${numeroParcelas})`,
              valor: valorParcela,
              tipo,
              category_id: categoryId,
              detalhes: `${detalhes} - Parcela ${i + 1}/${numeroParcelas}`,
              quando: dataTransacao.toISOString().split('T')[0]
            })
          }
        } else {
          await createTransaction(formData)
        }
        
        toast({
          title: "Sucesso!",
          description: "Transação adicionada com sucesso",
        })
      }

      onSuccess()
    } catch (error: any) {
      toast({
        title: "Erro ao salvar transação",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-h-full overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <TransactionFormBasicInfo
          estabelecimento={estabelecimento}
          valor={valor}
          tipo={tipo}
          onEstabelecimentoChange={setEstabelecimento}
          onValorChange={setValor}
          onTipoChange={handleTipoChange}
        />

        <TransactionFormClassification
          categoryId={categoryId}
          onCategoryChange={setCategoryId}
        />

        <TransactionFormScheduling
          quando={quando}
          onQuandoChange={setQuando}
        />

        <TransactionFormDetails
          detalhes={detalhes}
          onDetalhesChange={setDetalhes}
        />

        {!editingTransaction && (
          <TransactionFormSpecialOptions
            recorrente={recorrente}
            recorrencia={recorrencia}
            parcelado={parcelado}
            numeroParcelas={numeroParcelas}
            onRecorrenteChange={setRecorrente}
            onRecorrenciaChange={setRecorrencia}
            onParceladoChange={setParcelado}
            onNumeroParcelasChange={setNumeroParcelas}
          />
        )}

        <div className="sticky bottom-0 bg-background border-t pt-4 mt-6">
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 min-h-[44px] text-sm font-medium"
          >
            {loading ? 'Salvando...' : editingTransaction ? 'Atualizar Transação' : 'Adicionar Transação'}
          </Button>
        </div>
      </form>
    </div>
  )
}
