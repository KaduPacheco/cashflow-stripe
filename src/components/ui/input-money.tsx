
import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InputMoneyProps {
  label?: string
  value: string | number
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  className?: string
  error?: string
}

/**
 * Componente de input para valores monetários
 * @param label - Texto do label
 * @param value - Valor atual do input
 * @param onChange - Callback para mudanças de valor
 * @param placeholder - Texto placeholder
 * @param required - Se o campo é obrigatório
 * @param className - Classes CSS adicionais
 * @param error - Mensagem de erro
 */
export const InputMoney = React.forwardRef<HTMLInputElement, InputMoneyProps>(
  ({ label, value, onChange, placeholder = "0,00", required, className, error }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
      const inputValue = e.target.value
      // Remove caracteres não numéricos exceto vírgula e ponto
      const cleanValue = inputValue.replace(/[^\d.,]/g, '')
      onChange(cleanValue)
    }

    return (
      <div className="space-y-2">
        {label && (
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-green-500" />
            <Label className={cn("text-sm font-medium text-muted-foreground", required && "after:content-['*'] after:text-red-500")}>
              {label}
            </Label>
          </div>
        )}
        <Input
          ref={ref}
          type="number"
          step="0.01"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={cn(
            "bg-input text-foreground dark:bg-[#1e293b] dark:text-white border-border placeholder:text-muted-foreground",
            error && "border-red-500",
            className
          )}
          required={required}
        />
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    )
  }
)

InputMoney.displayName = "InputMoney"
