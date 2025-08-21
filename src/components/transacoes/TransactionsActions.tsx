
import React from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'

interface TransactionsActionsProps {
  hasTransactions: boolean
  onCreateNew: () => void
  onDeleteAll: () => void
  isReadOnly: boolean
}

export function TransactionsActions({ 
  hasTransactions, 
  onCreateNew, 
  onDeleteAll, 
  isReadOnly 
}: TransactionsActionsProps) {
  // Modo gratuito premium: sempre permite todas as ações
  const actuallyReadOnly = false

  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
      {hasTransactions && (
        <Button
          variant="destructive"
          size="sm"
          onClick={onDeleteAll}
          disabled={actuallyReadOnly}
          className="w-full sm:w-auto"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Remover Todas
        </Button>
      )}
      
      <Button onClick={onCreateNew} disabled={actuallyReadOnly} className="w-full sm:w-auto">
        <Plus className="mr-2 h-4 w-4" />
        Nova Transação
      </Button>
    </div>
  )
}
