
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { FormSectionTitle } from '@/components/ui/form-section-title'
import { FileText } from 'lucide-react'

interface TransactionFormDetailsProps {
  detalhes: string
  onDetalhesChange: (value: string) => void
}

export const TransactionFormDetails: React.FC<TransactionFormDetailsProps> = ({
  detalhes,
  onDetalhesChange
}) => {
  return (
    <div className="space-y-4">
      <FormSectionTitle 
        title="Detalhes Adicionais" 
        dotColor="bg-blue-500" 
      />

      <div>
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-4 w-4 text-gray-500" />
          <Label className="text-sm font-medium text-muted-foreground">Observações</Label>
        </div>
        <Textarea
          placeholder="Informações adicionais..."
          value={detalhes}
          onChange={(e) => onDetalhesChange(e.target.value)}
          className="min-h-[80px] resize-none bg-input text-foreground dark:bg-[#1e293b] dark:text-white border-border placeholder:text-muted-foreground"
        />
      </div>
    </div>
  )
}
