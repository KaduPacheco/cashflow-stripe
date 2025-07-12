
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ResponsiveModal } from '@/components/ui/responsive-modal'
import { TransactionSummaryCards } from '@/components/transactions/TransactionSummaryCards'
import { TransactionFilters } from '@/components/transactions/TransactionFilters'
import { TransactionForm } from '@/components/transacoes/TransactionForm'
import { TransactionsList } from '@/components/transacoes/TransactionsList'
import { TransactionsActions } from '@/components/transacoes/TransactionsActions'
import { useTransactions } from '@/hooks/useTransactions'
import { useReadOnlyMode } from '@/hooks/useReadOnlyMode'
import { ReadOnlyWrapper } from '@/components/subscription/ReadOnlyWrapper'
import { SubscriptionGate } from '@/components/subscription/SubscriptionGate'
import { Transacao } from '@/types/transaction'

export default function Transacoes() {
  const { 
    transacoes, 
    loading, 
    totals,
    searchTerm,
    setSearchTerm,
    typeFilter,
    setTypeFilter,
    categoryFilter,
    setCategoryFilter,
    clearFilters,
    deleteTransaction,
    deleteAllTransactions
  } = useTransactions()
  
  const { isReadOnly } = useReadOnlyMode()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transacao | null>(null)

  const handleEdit = (transacao: Transacao) => {
    setEditingTransaction(transacao)
    setDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return
    await deleteTransaction(id)
  }

  const handleCreateNew = () => {
    setEditingTransaction(null)
    setDialogOpen(true)
  }

  const handleFormSuccess = () => {
    setDialogOpen(false)
    setEditingTransaction(null)
  }

  return (
    <div className="space-y-4 px-2 sm:px-6 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-400">Transações</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gerencie suas transações financeiras
          </p>
        </div>
        
        <div className="sm:hidden">
          <ReadOnlyWrapper message="Criação de transações disponível apenas na versão premium">
            <TransactionsActions 
              hasTransactions={transacoes.length > 0}
              onCreateNew={handleCreateNew}
              onDeleteAll={deleteAllTransactions}
              isReadOnly={isReadOnly}
            />
          </ReadOnlyWrapper>
        </div>
      </div>

      <SubscriptionGate>
        <TransactionSummaryCards 
          receitas={totals.receitas} 
          despesas={totals.despesas} 
          saldo={totals.saldo} 
        />
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg sm:text-xl">Filtros</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <TransactionFilters 
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              typeFilter={typeFilter}
              onTypeFilterChange={setTypeFilter}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
              onClearFilters={clearFilters}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3">
            <CardTitle className="text-lg sm:text-xl">Lista de Transações</CardTitle>
            <div className="hidden sm:block">
              <TransactionsActions 
                hasTransactions={transacoes.length > 0}
                onCreateNew={handleCreateNew}
                onDeleteAll={deleteAllTransactions}
                isReadOnly={isReadOnly}
              />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <TransactionsList 
              transacoes={transacoes}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCreateNew={handleCreateNew}
              isReadOnly={isReadOnly}
              isEmpty={transacoes.length === 0}
            />
          </CardContent>
        </Card>

        <ResponsiveModal
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title={editingTransaction ? 'Editar Transação' : 'Nova Transação'}
        >
          <TransactionForm 
            onSuccess={handleFormSuccess}
            editingTransaction={editingTransaction}
          />
        </ResponsiveModal>
      </SubscriptionGate>
    </div>
  )
}
