
import { supabase } from '@/lib/supabase'
import { ValidationService } from './validationService'
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/config/constants'
import type { TransactionFormData } from '@/types/transaction'

export class TransactionService {
  static async createTransaction(userId: string, formData: TransactionFormData) {
    // Validate data
    const valueValidation = ValidationService.validateTransactionValue(formData.valor)
    if (valueValidation) {
      throw new Error(valueValidation)
    }

    const descriptionValidation = ValidationService.validateDescription(formData.detalhes || '')
    if (descriptionValidation) {
      throw new Error(descriptionValidation)
    }

    try {
      const transacaoData = {
        ...formData,
        userId,
      }

      const { error } = await supabase
        .from('transacoes')
        .insert([transacaoData])

      if (error) throw error
      
      return { success: true, message: SUCCESS_MESSAGES.TRANSACTION_CREATED }
    } catch (error: any) {
      console.error('Transaction creation error:', error)
      throw new Error(error.message || ERROR_MESSAGES.GENERIC_ERROR)
    }
  }

  static async updateTransaction(id: number, userId: string, formData: TransactionFormData) {
    // Validate data
    const valueValidation = ValidationService.validateTransactionValue(formData.valor)
    if (valueValidation) {
      throw new Error(valueValidation)
    }

    try {
      const transacaoData = {
        ...formData,
        userId,
      }

      const { error } = await supabase
        .from('transacoes')
        .update(transacaoData)
        .eq('id', id)

      if (error) throw error
      
      return { success: true, message: SUCCESS_MESSAGES.TRANSACTION_UPDATED }
    } catch (error: any) {
      console.error('Transaction update error:', error)
      throw new Error(error.message || ERROR_MESSAGES.GENERIC_ERROR)
    }
  }

  static async deleteTransaction(id: number) {
    try {
      const { error } = await supabase
        .from('transacoes')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      return { success: true, message: SUCCESS_MESSAGES.TRANSACTION_DELETED }
    } catch (error: any) {
      console.error('Transaction deletion error:', error)
      throw new Error(error.message || ERROR_MESSAGES.GENERIC_ERROR)
    }
  }

  static async deleteAllTransactions(userId: string) {
    try {
      const { error } = await supabase
        .from('transacoes')
        .delete()
        .eq('userId', userId)

      if (error) throw error
      
      return { success: true, message: 'Todas as transações foram excluídas com sucesso!' }
    } catch (error: any) {
      console.error('Bulk transaction deletion error:', error)
      throw new Error(error.message || ERROR_MESSAGES.GENERIC_ERROR)
    }
  }
}
