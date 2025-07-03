
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface FormBasicInfoProps {
  descricao: string
  valor: string
  onDescricaoChange: (value: string) => void
  onValorChange: (value: string) => void
}

export function FormBasicInfo({ 
  descricao, 
  valor, 
  onDescricaoChange, 
  onValorChange 
}: FormBasicInfoProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        Informações Básicas
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 bg-orange-400 rounded"></div>
            <Label className="text-sm font-medium text-muted-foreground">Descrição</Label>
          </div>
          <Input
            value={descricao}
            onChange={(e) => onDescricaoChange(e.target.value)}
            placeholder="Ex: IPTU, Salário, Energia..."
            className="bg-input text-foreground dark:bg-[#1e293b] dark:text-white border-border placeholder:text-muted-foreground"
            required
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 bg-orange-400 rounded"></div>
            <Label className="text-sm font-medium text-muted-foreground">Valor</Label>
          </div>
          <Input
            type="number"
            step="0.01"
            value={valor}
            onChange={(e) => onValorChange(e.target.value)}
            placeholder="Ex: 1.500,00"
            className="bg-input text-foreground dark:bg-[#1e293b] dark:text-white border-border placeholder:text-muted-foreground"
            required
          />
        </div>
      </div>
    </div>
  )
}
