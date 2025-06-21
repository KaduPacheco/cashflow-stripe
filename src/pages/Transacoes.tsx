
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { TransactionSummaryCards } from '@/components/transactions/TransactionSummaryCards'
import { TransactionFilters } from '@/components/transactions/TransactionFilters'
import { TransactionForm } from '@/components/transacoes/TransactionForm'
import { TransactionsList } from '@/components/transacoes/TransactionsList'
import { TransactionsActions } from '@/components/transacoes/TransactionsActions'
import { useTransactions } from '@/hooks/useTransactions'
import { useReadOnlyMode } from '@/hooks/useReadOnlyMode'
import { ReadOnlyWrapper } from '@/components/subscription/ReadOnlyWrapper'
import { SubscriptionGate } from '@/components/subscription/SubscriptionGate'
import { Transacao, TransactionFormData } from '@/types/transaction'

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
    createTransaction,
    updateTransaction,
    deleteTransaction,
    deleteAllTransactions
  } = useTransactions()
  
  const { isReadOnly } = useReadOnlyMode()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transacao | null>(null)
  const [formData, setFormData] = useState<TransactionFormData>({
    quando: '',
    estabelecimento: '',
    valor: 0,
    detalhes: '',
    tipo: '',
    category_id: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, formData)
      } else {
        await createTransaction(formData)
      }

      setDialogOpen(false)
      setEditingTransaction(null)
      setFormData({
        quando: '',
        estabelecimento: '',
        valor: 0,
        detalhes: '',
        tipo: '',
        category_id: '',
      })
    } catch (error) {
      // Erro já tratado no hook
    }
  }

  const handleEdit = (transacao: Transacao) => {
    setEditingTransaction(transacao)
    setFormData({
      quando: transacao.quando || '',
      estabelecimento: transacao.estabelecimento || '',
      valor: transacao.valor || 0,
      detalhes: transacao.detalhes || '',
      tipo: transacao.tipo || '',
      category_id: transacao.category_id || '',
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return
    await deleteTransaction(id)
  }

  const handleCreateNew = () => {
    setEditingTransaction(null)
    setFormData({
      quando: '',
      estabelecimento: '',
      valor: 0,
      detalhes: '',
      tipo: '',
      category_id: '',
    })
    setDialogOpen(true)
  }

  return (
    <div className="space-y-4 px-2 sm:px-6 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Transações</h1>
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

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">
                {editingTransaction ? 'Editar Transação' : 'Nova Transação'}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {editingTransaction 
                  ? 'Faça as alterações necessárias na transação.' 
                  : 'Adicione uma nova receita ou despesa.'}
              </DialogDescription>
            </DialogHeader>
            <TransactionForm 
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
              isEditing={!!editingTransaction}
            />
          </DialogContent>
        </Dialog>
      </SubscriptionGate>
    </div>
  )
}
