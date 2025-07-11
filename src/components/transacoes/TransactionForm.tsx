
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { TransactionFormBasicInfo } from './form/TransactionFormBasicInfo'
import { TransactionFormClassification } from './form/TransactionFormClassification'
import { TransactionFormScheduling } from './form/TransactionFormScheduling'
import { TransactionFormDetails } from './form/TransactionFormDetails'
import { TransactionFormSpecialOptions } from './form/TransactionFormSpecialOptions'
import { useRecurringLogic } from '@/hooks/useRecurringLogic'

interface TransactionFormProps {
  onSuccess: () => void
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ onSuccess }) => {
  const { user } = useAuth()
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

  const handleTipoChange = (value: string) => {
    setTipo(value as 'receita' | 'despesa')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !estabelecimento || !valor || !categoryId) {
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
      
      if (parcelado && numeroParcelas > 1) {
        // Criar múltiplas transações parceladas
        const valorParcela = valorNumerico / numeroParcelas
        const promises = []
        
        for (let i = 0; i < numeroParcelas; i++) {
          const dataTransacao = new Date(quando)
          dataTransacao.setMonth(dataTransacao.getMonth() + i)
          
          promises.push(
            supabase.from('transacoes').insert({
              estabelecimento: `${estabelecimento} (${i + 1}/${numeroParcelas})`,
              valor: valorParcela,
              tipo,
              category_id: categoryId,
              detalhes: `${detalhes} - Parcela ${i + 1}/${numeroParcelas}`,
              quando: dataTransacao.toISOString(),
              userId: user.id
            } as any)
          )
        }
        
        await Promise.all(promises)
      } else {
        // Criar transação única
        const { error } = await supabase.from('transacoes').insert({
          estabelecimento,
          valor: valorNumerico,
          tipo,
          category_id: categoryId,
          detalhes,
          quando,
          userId: user.id
        } as any)

        if (error) throw error
      }

      toast({
        title: "Sucesso!",
        description: "Transação adicionada com sucesso",
      })

      // Reset form
      setEstabelecimento('')
      setValor('')
      setTipo('despesa')
      setCategoryId('')
      setQuando(new Date().toISOString().split('T')[0])
      setDetalhes('')
      setRecorrente(false)
      setParcelado(false)
      setNumeroParcelas(2)

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

        <div className="sticky bottom-0 bg-background border-t pt-4 mt-6">
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 min-h-[44px] text-sm font-medium"
          >
            {loading ? 'Salvando...' : 'Adicionar Transação'}
          </Button>
        </div>
      </form>
    </div>
  )
}
