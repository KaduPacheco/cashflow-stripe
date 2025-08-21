
import { useState, useMemo } from 'react'
import { Plus, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ResponsiveModal } from '@/components/ui/responsive-modal'
import { TransactionForm } from '@/components/transacoes/TransactionForm'
import { TransactionCard } from '@/components/transacoes/TransactionCard'
import { TransactionFilters } from '@/components/transactions/TransactionFilters'
import { TransactionSummaryCards } from '@/components/transactions/TransactionSummaryCards'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useSecureTransactions } from '@/hooks/useSecureTransactions'
import { useAuth } from '@/hooks/useAuth'
import type { Transacao } from '@/types/transaction'

export default function Transacoes() {
  const { user } = useAuth()
  const {
    transactions,
    loading,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    fetchTransactions
  } = useSecureTransactions()

  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transacao | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    categoria_id: '',
    tipo: '',
    dataInicio: '',
    dataFim: ''
  })

  // Filter transactions based on search and filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Search filter
      if (searchTerm && !transaction.estabelecimento?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      
      // Category filter
      if (filters.categoria_id && transaction.category_id !== filters.categoria_id) {
        return false
      }
      
      // Type filter
      if (filters.tipo && transaction.tipo !== filters.tipo) {
        return false
      }
      
      // Date filters
      if (filters.dataInicio && new Date(transaction.quando) < new Date(filters.dataInicio)) {
        return false
      }
      
      if (filters.dataFim && new Date(transaction.quando) > new Date(filters.dataFim)) {
        return false
      }
      
      return true
    })
  }, [transactions, searchTerm, filters])

  const handleFormSuccess = async () => {
    setShowForm(false)
    setEditingTransaction(null)
    await fetchTransactions(filters)
  }

  const handleEdit = (transaction: Transacao) => {
    setEditingTransaction(transaction)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      await deleteTransaction(id)
    }
  }

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
    fetchTransactions(newFilters)
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Acesso Restrito</h2>
          <p className="text-muted-foreground">Faça login para acessar suas transações.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Transações</h1>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nova Transação
        </Button>
      </div>

      <TransactionSummaryCards transactions={filteredTransactions} />

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por estabelecimento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filtros
        </Button>
      </div>

      {showFilters && (
        <TransactionFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {searchTerm || Object.values(filters).some(v => v) 
              ? 'Nenhuma transação encontrada com os filtros aplicados.' 
              : 'Nenhuma transação encontrada. Crie sua primeira transação!'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTransactions.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <ResponsiveModal
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open)
          if (!open) setEditingTransaction(null)
        }}
        title={editingTransaction ? 'Editar Transação' : 'Nova Transação'}
      >
        <TransactionForm 
          onSuccess={handleFormSuccess}
          editingTransaction={editingTransaction}
        />
      </ResponsiveModal>
    </div>
  )
}
