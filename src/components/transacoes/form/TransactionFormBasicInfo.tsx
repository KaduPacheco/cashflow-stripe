
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CurrencyInput } from '@/components/ui/currency-input'
import { DollarSign, Building2 } from 'lucide-react'

interface TransactionFormBasicInfoProps {
  tipo: string
  valor: number
  estabelecimento: string
  onTipoChange: (value: string) => void
  onValorChange: (value: number) => void
  onEstabelecimentoChange: (value: string) => void
}

export function TransactionFormBasicInfo({
  tipo,
  valor,
  estabelecimento,
  onTipoChange,
  onValorChange,
  onEstabelecimentoChange
}: TransactionFormBasicInfoProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        Informações Básicas
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-4 bg-orange-400 rounded"></div>
              <Label className="text-sm font-medium text-muted-foreground">Tipo</Label>
            </div>
            <Select value={tipo} onValueChange={onTipoChange}>
              <SelectTrigger className="bg-input text-foreground dark:bg-[#1e293b] dark:text-white border-border">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="receita">Receita</SelectItem>
                <SelectItem value="despesa">Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <Label className="text-sm font-medium text-muted-foreground">Valor</Label>
            </div>
            <CurrencyInput
              value={valor}
              onChange={onValorChange}
              required
              className="bg-input text-foreground dark:bg-[#1e293b] dark:text-white border-border placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-4 w-4 text-blue-500" />
            <Label className="text-sm font-medium text-muted-foreground">Estabelecimento</Label>
          </div>
          <Input
            placeholder="Ex: Supermercado, Salário, etc."
            value={estabelecimento}
            onChange={(e) => onEstabelecimentoChange(e.target.value)}
            className="bg-input text-foreground dark:bg-[#1e293b] dark:text-white border-border placeholder:text-muted-foreground"
          />
        </div>
      </div>
    </div>
  )
}
