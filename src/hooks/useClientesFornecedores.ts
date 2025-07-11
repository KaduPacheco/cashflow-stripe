
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { ClienteFornecedor } from '@/types/contas'
import { toast } from 'sonner'

export function useClientesFornecedores() {
  const { user } = useAuth()
  const [clientesFornecedores, setClientesFornecedores] = useState<ClienteFornecedor[]>([])
  const [loading, setLoading] = useState(true)

  const fetchClientesFornecedores = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('clientes_fornecedores')
        .select('*')
        .eq('user_id', user.id)
        .eq('ativo', true)
        .order('nome')

      if (error) {
        console.error('Erro ao carregar clientes/fornecedores:', error)
        toast.error('Erro ao carregar clientes/fornecedores')
        return
      }

      setClientesFornecedores(data || [])
    } catch (error) {
      console.error('Erro ao carregar clientes/fornecedores:', error)
      toast.error('Erro ao carregar clientes/fornecedores')
    } finally {
      setLoading(false)
    }
  }

  const createClienteFornecedor = async (clienteFornecedor: Omit<ClienteFornecedor, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('clientes_fornecedores')
        .insert({
          ...clienteFornecedor,
          user_id: user.id
        })
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar cliente/fornecedor:', error)
        toast.error('Erro ao criar cliente/fornecedor')
        return null
      }

      toast.success('Cliente/Fornecedor criado com sucesso!')
      fetchClientesFornecedores()
      return data
    } catch (error) {
      console.error('Erro ao criar cliente/fornecedor:', error)
      toast.error('Erro ao criar cliente/fornecedor')
      return null
    }
  }

  const updateClienteFornecedor = async (id: string, updates: Partial<ClienteFornecedor>) => {
    try {
      const { data, error } = await supabase
        .from('clientes_fornecedores')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Erro ao atualizar cliente/fornecedor:', error)
        toast.error('Erro ao atualizar cliente/fornecedor')
        return null
      }

      toast.success('Cliente/Fornecedor atualizado com sucesso!')
      fetchClientesFornecedores()
      return data
    } catch (error) {
      console.error('Erro ao atualizar cliente/fornecedor:', error)
      toast.error('Erro ao atualizar cliente/fornecedor')
      return null
    }
  }

  const deleteClienteFornecedor = async (id: string) => {
    try {
      // Marcar como inativo ao invés de deletar
      const { error } = await supabase
        .from('clientes_fornecedores')
        .update({ ativo: false })
        .eq('id', id)

      if (error) {
        console.error('Erro ao deletar cliente/fornecedor:', error)
        toast.error('Erro ao deletar cliente/fornecedor')
        return false
      }

      toast.success('Cliente/Fornecedor removido com sucesso!')
      fetchClientesFornecedores()
      return true
    } catch (error) {
      console.error('Erro ao deletar cliente/fornecedor:', error)
      toast.error('Erro ao deletar cliente/fornecedor')
      return false
    }
  }

  useEffect(() => {
    fetchClientesFornecedores()
  }, [user])

  return {
    clientesFornecedores,
    loading,
    fetchClientesFornecedores,
    createClienteFornecedor,
    updateClienteFornecedor,
    deleteClienteFornecedor
  }
}
