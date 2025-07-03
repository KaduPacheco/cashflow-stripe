
import { Button } from '@/components/ui/button'

interface FormActionsProps {
  loading: boolean
  onCancel?: () => void
  isEditing?: boolean
}

export function FormActions({ loading, onCancel, isEditing = false }: FormActionsProps) {
  return (
    <div className="flex gap-3 pt-4">
      {onCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="flex-1"
        >
          Cancelar
        </Button>
      )}
      
      <Button 
        type="submit"
        disabled={loading}
        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
      >
        {loading ? 'Processando...' : (isEditing ? 'Atualizar' : 'Salvar')}
      </Button>
    </div>
  )
}
