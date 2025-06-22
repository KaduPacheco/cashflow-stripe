
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings, CreditCard } from 'lucide-react'

interface FormSpecialOptionsProps {
  recorrente: boolean
  recorrencia: string
  parcelado: boolean
  numeroParcelas: number
  onRecorrenteChange: (checked: boolean) => void
  onRecorrenciaChange: (value: string) => void
  onParceladoChange: (checked: boolean) => void
  onNumeroParcelasChange: (value: number) => void
}

export function FormSpecialOptions({
  recorrente,
  recorrencia,
  parcelado,
  numeroParcelas,
  onRecorrenteChange,
  onRecorrenciaChange,
  onParceladoChange,
  onNumeroParcelasChange
}: FormSpecialOptionsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        Opções Especiais
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-blue-500" />
            <div>
              <div className="text-sm font-medium">Lançamento Recorrente</div>
              <div className="text-xs text-gray-500">Repetir automaticamente a cada período</div>
            </div>
          </div>
          <Switch
            checked={recorrente}
            onCheckedChange={onRecorrenteChange}
          />
        </div>

        {recorrente && (
          <Select value={recorrencia} onValueChange={onRecorrenciaChange}>
            <SelectTrigger className="border-green-200">
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

        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-blue-500" />
            <div>
              <div className="text-sm font-medium">Lançamento Parcelado</div>
              <div className="text-xs text-gray-500">Dividir em várias parcelas mensais</div>
            </div>
          </div>
          <Switch
            checked={parcelado}
            onCheckedChange={onParceladoChange}
          />
        </div>

        {parcelado && (
          <div>
            <Label className="text-sm font-medium mb-2 block">Número de Parcelas</Label>
            <Input
              type="number"
              min="2"
              max="60"
              value={numeroParcelas}
              onChange={(e) => onNumeroParcelasChange(Number(e.target.value))}
              placeholder="Ex: 12"
              className="border-green-200 focus:border-green-400"
            />
          </div>
        )}
      </div>
    </div>
  )
}
