
import React from 'react'
import { VirtualizedTransactionsList } from './VirtualizedTransactionsList'
import { Transacao } from '@/types/transaction'

interface TransactionsListProps {
  transacoes: Transacao[]
  onEdit: (transacao: Transacao) => void
  onDelete: (id: number) => void
  onCreateNew: () => void
  isReadOnly: boolean
  isEmpty: boolean
}

export function TransactionsList(props: TransactionsListProps) {
  return <VirtualizedTransactionsList {...props} />
}
