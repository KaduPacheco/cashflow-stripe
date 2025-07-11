import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import { toast } from 'sonner'
import type { Tables } from '@/integrations/supabase/types'

export type ClienteFornecedor = Tables<'clientes_fornecedores'>

export function useClientesFornecedores() {
  const { user } = useAuth()
  const [clientesFornecedores, setClientesFornecedores] = useState<ClienteFornecedor[]>([])
  const [loading, setLoading] = useState(false)

  const loadClientesFornecedores = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('clientes_fornecedores')
        .select('*')
        .eq('user_id', user.id)
        .eq('ativo', true as any)
        .order('nome')

      if (error) {
        console.error('Erro ao carregar clientes/fornecedores:', error)
        toast.error('Erro ao carregar clientes/fornecedores')
        return
      }

      setClientesFornecedores(data as any || [])
    } catch (error) {
      console.error('Erro ao carregar clientes/fornecedores:', error)
      toast.error('Erro ao carregar clientes/fornecedores')
    } finally {
      setLoading(false)
    }
  }

  const createClienteFornecedor = async (clienteFornecedor: Omit<ClienteFornecedor, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user?.id) return null

    try {
      const { data, error } = await supabase
        .from('clientes_fornecedores')
        .insert({
          ...clienteFornecedor,
          user_id: user.id,
        } as any)
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar cliente/fornecedor:', error)
        toast.error('Erro ao criar cliente/fornecedor')
        return null
      }

      await loadClientesFornecedores()
      return data
    } catch (error) {
      console.error('Erro ao criar cliente/fornecedor:', error)
      toast.error('Erro ao criar cliente/fornecedor')
      return null
    }
  }

  const updateClienteFornecedor = async (id: string, updates: Partial<ClienteFornecedor>) => {
    if (!user?.id) return null

    try {
      const { data, error } = await supabase
        .from('clientes_fornecedores')
        .update(updates as any)
        .eq('id', id as any)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Erro ao atualizar cliente/fornecedor:', error)
        toast.error('Erro ao atualizar cliente/fornecedor')
        return null
      }

      await loadClientesFornecedores()
      return data
    } catch (error) {
      console.error('Erro ao atualizar cliente/fornecedor:', error)
      toast.error('Erro ao atualizar cliente/fornecedor')
      return null
    }
  }

  const toggleAtivoClienteFornecedor = async (id: string) => {
    if (!user?.id) return

    try {
      const { error } = await supabase
        .from('clientes_fornecedores')
        .update({ ativo: false } as any)
        .eq('id', id as any)
        .eq('user_id', user.id)

      if (error) {
        console.error('Erro ao desativar cliente/fornecedor:', error)
        toast.error('Erro ao desativar cliente/fornecedor')
        return
      }

      await loadClientesFornecedores()
      toast.success('Cliente/Fornecedor desativado com sucesso')
    } catch (error) {
      console.error('Erro ao desativar cliente/fornecedor:', error)
      toast.error('Erro ao desativar cliente/fornecedor')
    }
  }

  useEffect(() => {
    loadClientesFornecedores()
  }, [user?.id])

  return {
    clientesFornecedores,
    loading,
    createClienteFornecedor,
    updateClienteFornecedor,
    toggleAtivoClienteFornecedor,
    loadClientesFornecedores
  }
}