
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { TransactionFormData } from '@/types/transaction'
import { TransactionFormBasicInfo } from './form/TransactionFormBasicInfo'
import { TransactionFormClassification } from './form/TransactionFormClassification'
import { TransactionFormScheduling } from './form/TransactionFormScheduling'
import { TransactionFormDetails } from './form/TransactionFormDetails'
import { TransactionFormSpecialOptions } from './form/TransactionFormSpecialOptions'

interface TransactionFormProps {
  formData: TransactionFormData
  setFormData: (data: TransactionFormData) => void
  onSubmit: (e: React.FormEvent) => void
  isEditing: boolean
}

export function TransactionForm({ formData, setFormData, onSubmit, isEditing }: TransactionFormProps) {
  const [recorrente, setRecorrente] = useState(false)
  const [recorrencia, setRecorrencia] = useState('mensal')
  const [parcelado, setParcelado] = useState(false)
  const [numeroParcelas, setNumeroParcelas] = useState(2)

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
