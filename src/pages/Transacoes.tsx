
import { useState, useMemo, useCallback } from 'react'
import { useTransactions } from '@/hooks/useTransactions'
import { TransactionsList } from '@/components/transacoes/TransactionsList'
import { TransactionForm } from '@/components/transacoes/TransactionForm'
import { TransactionFilters } from '@/components/transactions/TransactionFilters'
import { TransactionsActions } from '@/components/transacoes/TransactionsActions'
import { TransactionSummaryCards } from '@/components/transactions/TransactionSummaryCards'
import { ResponsiveModal } from '@/components/ui/responsive-modal'
import { motion } from 'framer-motion'
import type { Transacao } from '@/types/transaction'

export default function Transacoes() {
  const {
    transacoes,
    loading,
    totals,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    deleteAllTransactions,
    refetch
  } = useTransactions()

  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('todos')
  const [categoryFilter, setCategoryFilter] = useState('todas')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transacao | null>(null)

  const filteredTransacoes = useMemo(() => {
    return transacoes.filter(transacao => {
      const matchesSearch = !searchTerm || 
        transacao.estabelecimento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transacao.detalhes?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesType = typeFilter === 'todos' || transacao.tipo === typeFilter

      const matchesCategory = categoryFilter === 'todas' || 
        transacao.category_id === categoryFilter

      return matchesSearch && matchesType && matchesCategory
    })
  }, [transacoes, searchTerm, typeFilter, categoryFilter])

  const handleCreateNew = useCallback(() => {
    setEditingTransaction(null)
    setDialogOpen(true)
  }, [])

  const handleEdit = useCallback((transacao: Transacao) => {
    setEditingTransaction(transacao)
    setDialogOpen(true)
  }, [])

  const handleDelete = useCallback(async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      await deleteTransaction(id)
    }
  }, [deleteTransaction])

  const handleDeleteAll = useCallback(async () => {
    if (window.confirm('Tem certeza que deseja excluir TODAS as transações? Esta ação não pode ser desfeita!')) {
      await deleteAllTransactions()
    }
  }, [deleteAllTransactions])

  const handleFormSuccess = useCallback(async () => {
    setDialogOpen(false)
    setEditingTransaction(null)
    refetch()
  }, [refetch])

  const handleClearFilters = useCallback(() => {
    setSearchTerm('')
    setTypeFilter('todos')
    setCategoryFilter('todas')
  }, [])

  const isEmpty = filteredTransacoes.length === 0

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <motion.div 
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-400">Transações</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie suas transações financeiras
          </p>
        </div>
        
        <TransactionsActions 
          hasTransactions={transacoes.length > 0}
          onCreateNew={handleCreateNew}
          onDeleteAll={handleDeleteAll}
          isReadOnly={false}
        />
      </motion.div>

      <TransactionSummaryCards 
        receitas={totals.receitas}
        despesas={totals.despesas}
        saldo={totals.saldo}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <TransactionFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          onClearFilters={handleClearFilters}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <TransactionsList
          transacoes={filteredTransacoes}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreateNew={handleCreateNew}
          isReadOnly={false}
          isEmpty={isEmpty}
        />
      </motion.div>

      <ResponsiveModal
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingTransaction ? 'Editar Transação' : 'Nova Transação'}
      >
        <TransactionForm 
          onSuccess={handleFormSuccess}
          initialData={editingTransaction}
        />
      </ResponsiveModal>
    </div>
  )
}
