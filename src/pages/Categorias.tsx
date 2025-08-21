
import { useState } from 'react'
import { CategoriesList } from '@/components/categories/CategoriesList'
import { CategoryForm } from '@/components/categories/CategoryForm'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { ResponsiveModal } from '@/components/ui/responsive-modal'

export default function Categorias() {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-400">Categorias</h1>
          <p className="text-sm text-muted-foreground">Organize suas transações em categorias</p>
        </div>
        
        <Button 
          onClick={() => setDialogOpen(true)}
          className="w-full md:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      <CategoriesList />

      <ResponsiveModal
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Nova Categoria"
      >
        <CategoryForm onSuccess={() => setDialogOpen(false)} />
      </ResponsiveModal>
    </div>
  )
}
