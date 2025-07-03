
import { useContasFormLogic } from './form/useContasFormLogic'
import { ContasFormHeader } from './form/ContasFormHeader'
import { ContasFormDescription } from './form/ContasFormDescription'
import { FormBasicInfo } from './FormBasicInfo'
import { FormClassification } from './FormClassification'
import { FormScheduling } from './FormScheduling'
import { FormSpecialOptions } from './FormSpecialOptions'
import { FormActions } from './FormActions'
import type { ContaPagarReceber } from '@/types/contas'

interface ContasFormProps {
  tipo: 'pagar' | 'receber'
  conta?: ContaPagarReceber
  onSuccess: () => void
  onClose?: () => void
}

export function ContasForm({ tipo, conta, onSuccess, onClose }: ContasFormProps) {
  const { formData, loading, handleSubmit, handleChange } = useContasFormLogic(
    tipo,
    conta,
    onSuccess
  )

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <ContasFormHeader conta={conta} onClose={onClose} />

      <div className="p-4">
        <ContasFormDescription conta={conta} />

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

          {!conta && (
            <FormSpecialOptions
              recorrente={formData.recorrente}
              recorrencia={formData.recorrencia}
              parcelado={formData.parcelado}
              numeroParcelas={formData.numeroParcelas}
              onRecorrenteChange={(checked) => handleChange('recorrente', checked)}
              onRecorrenciaChange={(value) => handleChange('recorrencia', value)}
              onParceladoChange={(checked) => handleChange('parcelado', checked)}
              onNumeroParcelasChange={(value) => handleChange('numeroParcelas', value)}
            />
          )}

          <FormActions
            loading={loading}
            onCancel={onClose}
            isEditing={!!conta}
          />
        </form>
      </div>
    </div>
  )
}
