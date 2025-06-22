
import { Button } from '@/components/ui/button'

interface FormActionsProps {
  loading: boolean
  onCancel?: () => void
}

export function FormActions({ loading, onCancel }: FormActionsProps) {
  return (
    <div className="flex gap-3 pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
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
  )
}
