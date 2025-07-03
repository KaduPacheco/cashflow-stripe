
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Edit, Trash2 } from 'lucide-react'
import { ReadOnlyWrapper } from '@/components/subscription/ReadOnlyWrapper'

interface CategoriesListProps {
  categories: any[]
  onEdit: (category: any) => void
  onDelete: (id: string) => void
  isReadOnly?: boolean
}

export function CategoriesList({ categories, onEdit, onDelete, isReadOnly = false }: CategoriesListProps) {
  if (categories.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">Nenhuma categoria encontrada.</p>
      </div>
    )
  }

  const handleDelete = (category: any) => {
    if (category?.id) {
      onDelete(category.id);
    } else {
      console.error('ID da categoria não encontrado:', category);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <Card key={category.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-medium">{category.nome}</h3>
                {category.tags && (
                  <p className="text-sm text-muted-foreground">{category.tags}</p>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                <ReadOnlyWrapper message="Edição disponível apenas na versão premium" showOverlay={false}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(category)}
                    disabled={isReadOnly}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </ReadOnlyWrapper>
                
                <ReadOnlyWrapper message="Exclusão disponível apenas na versão premium" showOverlay={false}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(category)}
                    disabled={isReadOnly}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </ReadOnlyWrapper>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
