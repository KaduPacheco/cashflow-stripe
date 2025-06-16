import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
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

  const { categories, createCategory, updateCategory, deleteCategory, isLoading } = useCategories()
  const { toast } = useToast()
  const { isReadOnly } = useReadOnlyMode()

  const handleCreate = async () => {
    if (newCategoryName.trim() === '') {
      toast({
        title: 'Erro',
        description: 'O nome da categoria não pode estar vazio.',
        variant: 'destructive',
      })
      return
    }

    try {
      await createCategory({ nome: newCategoryName })
      toast({
        title: 'Sucesso',
        description: 'Categoria criada com sucesso.',
      })
      setIsCreateDialogOpen(false)
      setNewCategoryName('')
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar categoria.',
        variant: 'destructive',
      })
    }
  }

  const handleUpdate = async () => {
    if (!editingCategory || editingCategory.nome.trim() === '') {
      toast({
        title: 'Erro',
        description: 'O nome da categoria não pode estar vazio.',
        variant: 'destructive',
      })
      return
    }

    try {
      await updateCategory(editingCategory.id, { nome: editingCategory.nome })
      toast({
        title: 'Sucesso',
        description: 'Categoria atualizada com sucesso.',
      })
      setIsEditDialogOpen(false)
      setEditingCategory(null)
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar categoria.',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id)
      toast({
        title: 'Sucesso',
        description: 'Categoria excluída com sucesso.',
      })
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao excluir categoria.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categorias</h1>
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
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" onClick={handleCreate}>Criar</Button>
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
              onDelete={(id) => {
                if (!isReadOnly) {
                  handleDelete(id)
                }
              }}
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
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" onClick={handleUpdate}>Atualizar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SubscriptionGate>
    </div>
  )
}
