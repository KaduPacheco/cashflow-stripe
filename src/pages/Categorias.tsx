
import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCategories } from '@/hooks/useCategories'
import { CategoriesList } from '@/components/categories/CategoriesList'
import { SubscriptionGate } from '@/components/subscription/SubscriptionGate'
import { useReadOnlyMode } from '@/hooks/useReadOnlyMode'
import { ReadOnlyWrapper } from '@/components/subscription/ReadOnlyWrapper'

export default function Categorias() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingCategory, setEditingCategory] = useState<any>(null)

  const { categories, createCategory, updateCategory, deleteCategory, isLoading, isCreating, isUpdating, isDeleting } = useCategories()
  const { isReadOnly } = useReadOnlyMode()

  const handleCreate = async () => {
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) {
      return;
    }

    createCategory({ nome: trimmedName });
    setIsCreateDialogOpen(false);
    setNewCategoryName('');
  }

  const handleUpdate = async () => {
    if (!editingCategory || !editingCategory.nome?.trim()) {
      return;
    }

    updateCategory({
      id: editingCategory.id,
      updates: { nome: editingCategory.nome.trim() }
    });
    setIsEditDialogOpen(false);
    setEditingCategory(null);
  }

  const handleDelete = async (id: string) => {
    if (!id) {
      console.error('ID da categoria é obrigatório para exclusão');
      return;
    }
    
    deleteCategory(id);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-400">Categorias</h1>
          <p className="text-muted-foreground">
            Organize suas transações por categorias
          </p>
        </div>
        
        <ReadOnlyWrapper message="Criação de categorias disponível apenas na versão premium">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={isReadOnly}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Categoria</DialogTitle>
                <DialogDescription>
                  Adicione uma nova categoria para organizar suas transações.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nome
                  </Label>
                  <Input
                    id="name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="col-span-3"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCreate();
                      }
                    }}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  onClick={handleCreate}
                  disabled={!newCategoryName.trim() || isCreating}
                >
                  {isCreating ? 'Criando...' : 'Criar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </ReadOnlyWrapper>
      </div>

      <SubscriptionGate>
        <Card>
          <CardHeader>
            <CardTitle>Suas Categorias</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoriesList 
              categories={categories}
              onEdit={(category) => {
                if (!isReadOnly) {
                  setEditingCategory(category)
                  setIsEditDialogOpen(true)
                }
              }}
              onDelete={handleDelete}
              isReadOnly={isReadOnly}
            />
          </CardContent>
        </Card>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Categoria</DialogTitle>
              <DialogDescription>
                Atualize o nome da sua categoria.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nome
                </Label>
                <Input
                  id="name"
                  value={editingCategory?.nome || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, nome: e.target.value })}
                  className="col-span-3"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleUpdate();
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                onClick={handleUpdate}
                disabled={!editingCategory?.nome?.trim() || isUpdating}
              >
                {isUpdating ? 'Atualizando...' : 'Atualizar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SubscriptionGate>
    </div>
  )
}
