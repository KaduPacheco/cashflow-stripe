
import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormSectionTitle } from '@/components/ui/form-section-title'
import { InputMoney } from '@/components/ui/input-money'
import { Building, CreditCard } from 'lucide-react'

interface TransactionFormBasicInfoProps {
  tipo: string
  valor: number | string
  estabelecimento: string
  onTipoChange: (value: string) => void
  onValorChange: (value: string) => void
  onEstabelecimentoChange: (value: string) => void
}

export const TransactionFormBasicInfo: React.FC<TransactionFormBasicInfoProps> = ({
  tipo,
  valor,
  estabelecimento,
  onTipoChange,
  onValorChange,
  onEstabelecimentoChange
}) => {
  return (
    <div className="space-y-4">
      <FormSectionTitle 
        title="Informações Básicas" 
        dotColor="bg-green-500" 
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-4 w-4 text-blue-500" />
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
          <InputMoney
            label="Valor"
            value={valor}
            onChange={onValorChange}
            placeholder="Ex: 1.500,00"
            required
          />
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <Building className="h-4 w-4 text-orange-500" />
          <Label className="text-sm font-medium text-muted-foreground">Estabelecimento</Label>
        </div>
        <Input
          value={estabelecimento}
          onChange={(e) => onEstabelecimentoChange(e.target.value)}
          placeholder="Ex: Supermercado, Empresa, Cliente..."
          className="bg-input text-foreground dark:bg-[#1e293b] dark:text-white border-border placeholder:text-muted-foreground"
          required
        />
      </div>
    </div>
  )
}
