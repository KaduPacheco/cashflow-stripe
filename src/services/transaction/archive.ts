
import { supabase } from '@/lib/supabase'
import { ValidationError, NetworkError } from '@/utils/errorHandler'

export class TransactionArchive {
  static async archive(id: number, userId: string) {
    try {
      // Since there's no archived column, we'll use a soft delete approach by adding metadata
      const { data: transaction, error } = await supabase
        .from('transacoes')
        .update({ 
          detalhes: `[ARCHIVED] ${new Date().toISOString()} - Transação arquivada`
        })
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
      // Remove the archived prefix from details
      const { data: currentTransaction, error: fetchError } = await supabase
        .from('transacoes')
        .select('detalhes')
        .eq('id', id)
        .eq('userId', userId)
        .single()

      if (fetchError) {
        throw new NetworkError(fetchError.message, 500, 'DATABASE_ERROR')
      }

      const cleanedDetails = currentTransaction.detalhes?.replace(/\[ARCHIVED\] \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z - Transação arquivada/, '').trim() || null

      const { data: transaction, error } = await supabase
        .from('transacoes')
        .update({ detalhes: cleanedDetails })
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
