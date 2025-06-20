
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { ContaPagarReceber } from '@/types/contas'
import { toast } from 'sonner'

export function useContasCrud() {
  const { user } = useAuth()

  const createConta = async (conta: Omit<ContaPagarReceber, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('contas_pagar_receber')
        .insert({
          ...conta,
          user_id: user.id
        })
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar conta:', error)
        toast.error('Erro ao criar conta')
        return null
      }

      toast.success('Conta criada com sucesso!')
      return data
    } catch (error) {
      console.error('Erro ao criar conta:', error)
      toast.error('Erro ao criar conta')
      return null
    }
  }

  const updateConta = async (id: string, updates: Partial<ContaPagarReceber>) => {
    try {
      const { data, error } = await supabase
        .from('contas_pagar_receber')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Erro ao atualizar conta:', error)
        toast.error('Erro ao atualizar conta')
        return null
      }

      toast.success('Conta atualizada com sucesso!')
      return data
    } catch (error) {
      console.error('Erro ao atualizar conta:', error)
      toast.error('Erro ao atualizar conta')
      return null
    }
  }

  const deleteConta = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contas_pagar_receber')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Erro ao deletar conta:', error)
        toast.error('Erro ao deletar conta')
        return false
      }

      toast.success('Conta deletada com sucesso!')
      return true
    } catch (error) {
      console.error('Erro ao deletar conta:', error)
      toast.error('Erro ao deletar conta')
      return false
    }
  }

  return {
    createConta,
    updateConta,
    deleteConta
  }
}
