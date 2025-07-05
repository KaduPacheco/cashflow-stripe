
import { Label } from '@/components/ui/label'
import { CategorySelector } from '@/components/transactions/CategorySelector'
import { FormSectionTitle } from '@/components/ui/form-section-title'
import { Tag } from 'lucide-react'

interface TransactionFormClassificationProps {
  categoryId: string
  onCategoryChange: (value: string) => void
}

export const TransactionFormClassification: React.FC<TransactionFormClassificationProps> = ({
  categoryId,
  onCategoryChange
}) => {
  return (
    <div className="space-y-4">
      <FormSectionTitle 
        title="Classificação" 
        dotColor="bg-green-500" 
      />

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
