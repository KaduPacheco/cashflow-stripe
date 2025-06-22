
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CreditCard, Tag } from 'lucide-react'
import { useCategories } from '@/hooks/useCategories'

interface FormClassificationProps {
  tipo: 'pagar' | 'receber'
  categoryId: string
  onCategoryChange: (value: string) => void
}

export function FormClassification({ 
  tipo, 
  categoryId, 
  onCategoryChange 
}: FormClassificationProps) {
  const { categories } = useCategories()

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-green-600">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        Classificação
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-4 w-4 text-blue-500" />
            <Label className="text-sm font-medium">Tipo</Label>
          </div>
          <Select value={tipo} disabled>
            <SelectTrigger className="border-green-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="receber">A Receber</SelectItem>
              <SelectItem value="pagar">A Pagar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Tag className="h-4 w-4 text-orange-500" />
            <Label className="text-sm font-medium">Categoria</Label>
          </div>
          <Select value={categoryId} onValueChange={onCategoryChange}>
            <SelectTrigger className="border-green-200">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
