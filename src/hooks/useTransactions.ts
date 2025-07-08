import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useCategories } from '@/hooks/useCategories'
import { toast } from '@/hooks/use-toast'
import { Transacao, TransactionFormData } from '@/types/transaction'
import { validateCategoryOwnership, calculateTotals } from '@/utils/transactionUtils'

export function useTransactions() {
  const { user } = useAuth()
  const { categories } = useCategories()
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const fetchTransacoes = async () => {
    try {
      const { data, error } = await supabase
        .from('transacoes')
        .select(`
          *,
          categorias (
            id,
            nome
          )
        `)
        .eq('userId', user?.id) // user?.id é sempre validado antes da chamada
        .order('created_at', { ascending: false })

      if (error) throw error
      setTransacoes(data || [])
    } catch (error: any) {
      toast({
        title: "Erro ao carregar transações",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredTransacoes = useMemo(() => {
    return transacoes.filter(transacao => {
      const matchesSearch = !searchTerm || 
        (transacao.estabelecimento?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
      const matchesType = !typeFilter || transacao.tipo === typeFilter
      const matchesCategory = !categoryFilter || transacao.category_id === categoryFilter
      
      return matchesSearch && matchesType && matchesCategory
    })
  }, [transacoes, searchTerm, typeFilter, categoryFilter])

  const totals = useMemo(() => calculateTotals(filteredTransacoes), [filteredTransacoes])

  const createTransaction = async (formData: TransactionFormData) => {
    // Validação: verificar se o usuário está logado
    if (!user?.id) {
      throw new Error("Usuário não autenticado")
    }

    // Validação: verificar se a categoria selecionada pertence ao usuário
    if (formData.category_id) {
      const categoryBelongsToUser = validateCategoryOwnership(formData.category_id, categories)
      if (!categoryBelongsToUser) {
        throw new Error("A categoria selecionada não é válida para este usuário.")
      }
    }

    try {
      const transacaoData = {
        ...formData,
        userId: user.id, // Sempre obrigatório agora
      }

      const { error } = await supabase
        .from('transacoes')
        .insert([transacaoData])

      if (error) throw error
      
      toast({ title: "Transação adicionada com sucesso!" })
      fetchTransacoes()
    } catch (error: any) {
      toast({
        title: "Erro ao salvar transação",
        description: error.message,
        variant: "destructive",
      })
      throw error
    }
  }

  const updateTransaction = async (id: number, formData: TransactionFormData) => {
    // Validação: verificar se o usuário está logado
    if (!user?.id) {
      throw new Error("Usuário não autenticado")
    }

    // Validação: verificar se a categoria selecionada pertence ao usuário
    if (formData.category_id) {
      const categoryBelongsToUser = validateCategoryOwnership(formData.category_id, categories)
      if (!categoryBelongsToUser) {
        throw new Error("A categoria selecionada não é válida para este usuário.")
      }
    }

    try {
      const transacaoData = {
        ...formData,
        userId: user.id, // Sempre obrigatório agora
      }

      const { error } = await supabase
        .from('transacoes')
        .update(transacaoData)
        .eq('id', id)

      if (error) throw error
      
      toast({ title: "Transação atualizada com sucesso!" })
      fetchTransacoes()
    } catch (error: any) {
      toast({
        title: "Erro ao salvar transação",
        description: error.message,
        variant: "destructive",
      })
      throw error
    }
  }

  const deleteTransaction = async (id: number) => {
    try {
      const { error } = await supabase
        .from('transacoes')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      toast({ title: "Transação excluída com sucesso!" })
      fetchTransacoes()
    } catch (error: any) {
      toast({
        title: "Erro ao excluir transação",
        description: error.message,
        variant: "destructive",
      })
      throw error
    }
  }

  const deleteAllTransactions = async () => {
    try {
      const { error } = await supabase
        .from('transacoes')
        .delete()
        .eq('userId', user?.id)

      if (error) throw error
      
      toast({ title: "Todas as transações foram excluídas com sucesso!" })
      fetchTransacoes()
    } catch (error: any) {
      toast({
        title: "Erro ao excluir transações",
        description: error.message,
        variant: "destructive",
      })
      throw error
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setTypeFilter('')
    setCategoryFilter('')
  }

  useEffect(() => {
    if (user) {
      fetchTransacoes()
    }
  }, [user])

  return {
    transacoes: filteredTransacoes,
    allTransacoes: transacoes,
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
    deleteAllTransactions,
    refetch: fetchTransacoes
  }
}
