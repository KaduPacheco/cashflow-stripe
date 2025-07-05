
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormSectionTitle } from '@/components/ui/form-section-title'
import { Calendar } from 'lucide-react'

interface TransactionFormSchedulingProps {
  quando: string
  onQuandoChange: (value: string) => void
}

export const TransactionFormScheduling: React.FC<TransactionFormSchedulingProps> = ({
  quando,
  onQuandoChange
}) => {
  return (
    <div className="space-y-4">
      <FormSectionTitle 
        title="Agendamento" 
        dotColor="bg-green-500" 
      />

      <div>
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="h-4 w-4 text-purple-500" />
          <Label className="text-sm font-medium text-muted-foreground">Data</Label>
        </div>
        <Input
          type="date"
          value={quando}
          onChange={(e) => onQuandoChange(e.target.value)}
          className="bg-input text-foreground dark:bg-[#1e293b] dark:text-white border-border"
        />
      </div>
    </div>
  )
}
