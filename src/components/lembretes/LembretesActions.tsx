
import React from 'react'
import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Plus, Trash2 } from 'lucide-react'

interface LembretesActionsProps {
  hasLembretes: boolean
  onCreateNew: () => void
  onDeleteAll: () => void
}

export function LembretesActions({ hasLembretes, onCreateNew, onDeleteAll }: LembretesActionsProps) {
  return (
    <div className="flex gap-2">
      {hasLembretes && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Remover Todos
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover todos os lembretes</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso irá remover permanentemente todos os seus lembretes.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={onDeleteAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Remover Todos
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      <Button onClick={onCreateNew} className="bg-primary hover:bg-primary/90">
        <Plus className="mr-2 h-4 w-4" />
        Novo Lembrete
      </Button>
    </div>
  )
}
