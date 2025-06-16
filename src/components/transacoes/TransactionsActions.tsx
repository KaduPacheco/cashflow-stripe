
import React from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import { ReadOnlyWrapper } from '@/components/subscription/ReadOnlyWrapper'

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
  return (
    <div className="flex gap-2">
      {hasTransactions && (
        <ReadOnlyWrapper message="Remoção de transações disponível apenas na versão premium">
          <Button
            variant="destructive"
            size="sm"
            onClick={onDeleteAll}
            disabled={isReadOnly}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remover Todas
          </Button>
        </ReadOnlyWrapper>
      )}
      
      <ReadOnlyWrapper message="Criação de transações disponível apenas na versão premium">
        <Button onClick={onCreateNew} disabled={isReadOnly}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Transação
        </Button>
      </ReadOnlyWrapper>
    </div>
  )
}
