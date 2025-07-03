
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from 'lucide-react'

interface FormSchedulingProps {
  dataVencimento: string
  onDataVencimentoChange: (value: string) => void
}

export function FormScheduling({ 
  dataVencimento, 
  onDataVencimentoChange 
}: FormSchedulingProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        Agendamento
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="h-4 w-4 text-purple-500" />
          <Label className="text-sm font-medium text-muted-foreground">Data Prevista</Label>
        </div>
        <Input
          type="date"
          value={dataVencimento}
          onChange={(e) => onDataVencimentoChange(e.target.value)}
          className="bg-input text-foreground dark:bg-[#1e293b] dark:text-white border-border"
          required
        />
      </div>
    </div>
  )
}
