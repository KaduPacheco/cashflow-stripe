
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { SecureTransactionService } from '@/services/secureTransactionService'
import { SecurityAuditService } from '@/services/securityAuditService'
import { toast } from 'sonner'
import type { Transacao } from '@/types/transaction'
import { ValidationError, NetworkError } from '@/utils/errorHandler'

export function useSecureTransactions() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transacao[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fetchTransactions = async (filters?: any) => {
    if (!user) return

    try {
      setLoading(true)
      const data = await SecureTransactionService.getTransactions(filters)
      setTransactions(data)
    } catch (error) {
      if (error instanceof ValidationError) {
        toast.error(error.message)
      } else if (error instanceof NetworkError) {
        toast.error('Erro de conexão. Tente novamente.')
      } else {
        toast.error('Erro inesperado ao carregar transações')
      }
      console.error('Error fetching transactions:', SecurityAuditService.maskSensitiveData(error))
    } finally {
      setLoading(false)
    }
  }

  const createTransaction = async (transactionData: Partial<Transacao>) => {
    if (!user) return

    try {
      setCreating(true)
      const newTransaction = await SecureTransactionService.createTransaction(transactionData)
      setTransactions(prev => [newTransaction, ...prev])
      toast.success('Transação criada com sucesso!')
      return newTransaction
    } catch (error) {
      if (error instanceof ValidationError) {
        toast.error(error.message)
      } else if (error instanceof NetworkError) {
        toast.error('Erro de conexão. Tente novamente.')
      } else {
        toast.error('Erro inesperado ao criar transação')
      }
      console.error('Error creating transaction:', SecurityAuditService.maskSensitiveData(error))
      throw error
    } finally {
      setCreating(false)
    }
  }

  const updateTransaction = async (id: number, updateData: Partial<Transacao>) => {
    if (!user) return

    try {
      setUpdating(true)
      const updatedTransaction = await SecureTransactionService.updateTransaction(id, updateData)
      setTransactions(prev =>
        prev.map(t => t.id === id ? updatedTransaction : t)
      )
      toast.success('Transação atualizada com sucesso!')
      return updatedTransaction
    } catch (error) {
      if (error instanceof ValidationError) {
        toast.error(error.message)
      } else if (error instanceof NetworkError) {
        toast.error('Erro de conexão. Tente novamente.')
      } else {
        toast.error('Erro inesperado ao atualizar transação')
      }
      console.error('Error updating transaction:', SecurityAuditService.maskSensitiveData(error))
      throw error
    } finally {
      setUpdating(false)
    }
  }

  const deleteTransaction = async (id: number) => {
    if (!user) return

    try {
      setDeleting(true)
      await SecureTransactionService.deleteTransaction(id)
      setTransactions(prev => prev.filter(t => t.id !== id))
      toast.success('Transação excluída com sucesso!')
    } catch (error) {
      if (error instanceof ValidationError) {
        toast.error(error.message)
      } else if (error instanceof NetworkError) {
        toast.error('Erro de conexão. Tente novamente.')
      } else {
        toast.error('Erro inesperado ao excluir transação')
      }
      console.error('Error deleting transaction:', SecurityAuditService.maskSensitiveData(error))
      throw error
    } finally {
      setDeleting(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchTransactions()
    }
  }, [user])

  return {
    transactions,
    loading,
    creating,
    updating,
    deleting,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    refetch: fetchTransactions
  }
}
