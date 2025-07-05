
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings, CreditCard } from 'lucide-react'

interface TransactionFormSpecialOptionsProps {
  recorrente: boolean
  recorrencia: string
  parcelado: boolean
  numeroParcelas: number
  onRecorrenteChange: (checked: boolean) => void
  onRecorrenciaChange: (value: string) => void
  onParceladoChange: (checked: boolean) => void
  onNumeroParcelasChange: (value: number) => void
}

export function TransactionFormSpecialOptions({
  recorrente,
  recorrencia,
  parcelado,
  numeroParcelas,
  onRecorrenteChange,
  onRecorrenciaChange,
  onParceladoChange,
  onNumeroParcelasChange
}: TransactionFormSpecialOptionsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        Opções Especiais
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-muted/50 dark:bg-[#1e293b]/50 rounded-lg">
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-blue-500" />
            <div>
              <div className="text-sm font-medium text-foreground">Transação Recorrente</div>
              <div className="text-xs text-muted-foreground">Repetir automaticamente a cada período</div>
            </div>
          </div>
          <Switch
            checked={recorrente}
            onCheckedChange={onRecorrenteChange}
          />
        </div>

        {recorrente && (
          <Select value={recorrencia} onValueChange={onRecorrenciaChange}>
            <SelectTrigger className="border-border bg-input dark:bg-[#1e293b]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mensal">Mensal</SelectItem>
              <SelectItem value="trimestral">Trimestral</SelectItem>
              <SelectItem value="semestral">Semestral</SelectItem>
              <SelectItem value="anual">Anual</SelectItem>
            </SelectContent>
          </Select>
        )}

        <div className="flex items-center justify-between p-3 bg-muted/50 dark:bg-[#1e293b]/50 rounded-lg">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-blue-500" />
            <div>
              <div className="text-sm font-medium text-foreground">Transação Parcelada</div>
              <div className="text-xs text-muted-foreground">Dividir em várias parcelas mensais</div>
            </div>
          </div>
          <Switch
            checked={parcelado}
            onCheckedChange={onParceladoChange}
          />
        </div>

        {parcelado && (
          <div>
            <Label className="text-sm font-medium text-muted-foreground mb-2 block">Número de Parcelas</Label>
            <Input
              type="number"
              min="2"
              max="12"
              value={numeroParcelas}
              onChange={(e) => onNumeroParcelasChange(Number(e.target.value))}
              placeholder="Ex: 12"
              className="bg-input text-foreground dark:bg-[#1e293b] dark:text-white border-border placeholder:text-muted-foreground"
            />
          </div>
        )}
      </div>
    </div>
  )
}
