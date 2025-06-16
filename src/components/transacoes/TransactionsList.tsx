
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Transacao } from '@/types/transaction'
import { TransactionCard } from './TransactionCard'

interface TransactionsListProps {
  transacoes: Transacao[]
  onEdit: (transacao: Transacao) => void
  onDelete: (id: number) => void
  onCreateNew: () => void
  isReadOnly: boolean
  isEmpty: boolean
}

export function TransactionsList({ 
  transacoes, 
  onEdit, 
  onDelete, 
  onCreateNew, 
  isReadOnly,
  isEmpty 
}: TransactionsListProps) {
  if (isEmpty) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground mb-4">
            {transacoes.length === 0 ? 'Nenhuma transação encontrada' : 'Nenhuma transação encontrada com os filtros aplicados'}
          </p>
          <Button onClick={onCreateNew} className="bg-primary hover:bg-primary/90">
            Adicionar primeira transação
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {transacoes.map((transacao) => (
        <TransactionCard 
          key={transacao.id}
          transacao={transacao}
          onEdit={onEdit}
          onDelete={onDelete}
          isReadOnly={isReadOnly}
        />
      ))}
    </div>
  )
}
