
import React from 'react'
import { Button } from '@/components/ui/button'
import { TransactionFormData } from '@/types/transaction'
import { TransactionFormBasicInfo } from './form/TransactionFormBasicInfo'
import { TransactionFormClassification } from './form/TransactionFormClassification'
import { TransactionFormScheduling } from './form/TransactionFormScheduling'
import { TransactionFormDetails } from './form/TransactionFormDetails'
import { TransactionFormSpecialOptions } from './form/TransactionFormSpecialOptions'
import { useRecurringLogic } from '@/hooks/useRecurringLogic'

interface TransactionFormProps {
  formData: TransactionFormData
  setFormData: (data: TransactionFormData) => void
  onSubmit: (e: React.FormEvent) => void
  isEditing: boolean
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ 
  formData, 
  setFormData, 
  onSubmit, 
  isEditing 
}) => {
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

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <TransactionFormBasicInfo
        tipo={formData.tipo}
        valor={formData.valor}
        estabelecimento={formData.estabelecimento}
        onTipoChange={(value) => setFormData({...formData, tipo: value})}
        onValorChange={(value) => setFormData({...formData, valor: value})}
        onEstabelecimentoChange={(value) => setFormData({...formData, estabelecimento: value})}
      />

      <TransactionFormClassification
        categoryId={formData.category_id}
        onCategoryChange={(value) => setFormData({...formData, category_id: value})}
      />

      <TransactionFormScheduling
        quando={formData.quando}
        onQuandoChange={(value) => setFormData({...formData, quando: value})}
      />

      {!isEditing && (
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

      <TransactionFormDetails
        detalhes={formData.detalhes}
        onDetalhesChange={(value) => setFormData({...formData, detalhes: value})}
      />

      <div className="pt-4">
        <Button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isEditing ? 'Atualizar' : 'Adicionar'} Transação
        </Button>
      </div>
    </form>
  )
}
