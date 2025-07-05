
import { Label } from '@/components/ui/label'
import { CategorySelector } from '@/components/transactions/CategorySelector'
import { Tag } from 'lucide-react'

interface TransactionFormClassificationProps {
  categoryId: string
  onCategoryChange: (value: string) => void
}

export function TransactionFormClassification({
  categoryId,
  onCategoryChange
}: TransactionFormClassificationProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        Classificação
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <Tag className="h-4 w-4 text-orange-500" />
          <Label className="text-sm font-medium text-muted-foreground">Categoria</Label>
        </div>
        <CategorySelector
          value={categoryId}
          onValueChange={onCategoryChange}
          placeholder="Selecione a categoria"
        />
      </div>
    </div>
  )
}
