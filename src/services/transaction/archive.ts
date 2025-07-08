
import { supabase } from '@/lib/supabase'
import { ValidationError, NetworkError } from '@/utils/errorHandler'

export class TransactionArchive {
  static async archive(id: number, userId: string) {
    try {
      const { data: transaction, error } = await supabase
        .from('transacoes')
        .update({ archived: true })
        .eq('id', id)
        .eq('userId', userId)
        .select()
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new ValidationError('Transação não encontrada ou sem permissão', 'id')
        }
        throw new NetworkError(error.message, 500, 'DATABASE_ERROR')
      }

      return { success: true, data: transaction }
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NetworkError) {
        throw error
      }
      throw new NetworkError('Erro ao arquivar transação', 500, 'UNKNOWN_ERROR')
    }
  }

  static async unarchive(id: number, userId: string) {
    try {
      const { data: transaction, error } = await supabase
        .from('transacoes')
        .update({ archived: false })
        .eq('id', id)
        .eq('userId', userId)
        .select()
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new ValidationError('Transação não encontrada ou sem permissão', 'id')
        }
        throw new NetworkError(error.message, 500, 'DATABASE_ERROR')
      }

      return { success: true, data: transaction }
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NetworkError) {
        throw error
      }
      throw new NetworkError('Erro ao desarquivar transação', 500, 'UNKNOWN_ERROR')
    }
  }
}
