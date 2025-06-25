
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TransactionService } from '@/services/transactionService'
import { supabase } from '@/lib/supabase'

// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      })),
      insert: vi.fn(() => Promise.resolve({ data: {}, error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: {}, error: null }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      }))
    }))
  }
}))

describe('TransactionService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createTransaction', () => {
    it('should create a transaction successfully', async () => {
      const transactionData = {
        estabelecimento: 'Test Store',
        valor: 100,
        tipo: 'receita' as const,
        category_id: 'cat-1',
        detalhes: 'Test transaction'
      }

      const mockInsert = vi.fn(() => Promise.resolve({ data: transactionData, error: null }))
      const mockFrom = vi.fn(() => ({ insert: mockInsert }))
      
      vi.mocked(supabase.from).mockImplementation(mockFrom)

      const result = await TransactionService.createTransaction('user-1', transactionData)
      
      expect(result.success).toBe(true)
      expect(supabase.from).toHaveBeenCalledWith('transacoes')
      expect(mockInsert).toHaveBeenCalledWith([{ ...transactionData, userId: 'user-1' }])
    })

    it('should throw error when create fails', async () => {
      const transactionData = {
        estabelecimento: 'Test Store',
        valor: 100,
        tipo: 'receita' as const,
        category_id: 'cat-1',
        detalhes: 'Test transaction'
      }

      const mockError = new Error('Database error')
      const mockInsert = vi.fn(() => Promise.resolve({ data: null, error: mockError }))
      const mockFrom = vi.fn(() => ({ insert: mockInsert }))
      
      vi.mocked(supabase.from).mockImplementation(mockFrom)

      await expect(TransactionService.createTransaction('user-1', transactionData)).rejects.toThrow('Database error')
    })
  })

  describe('updateTransaction', () => {
    it('should update a transaction successfully', async () => {
      const transactionData = {
        estabelecimento: 'Updated Store',
        valor: 200,
        tipo: 'despesa' as const,
        category_id: 'cat-2',
        detalhes: 'Updated transaction'
      }

      const mockUpdate = vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: transactionData, error: null }))
      }))
      const mockFrom = vi.fn(() => ({ update: mockUpdate }))
      
      vi.mocked(supabase.from).mockImplementation(mockFrom)

      const result = await TransactionService.updateTransaction(1, 'user-1', transactionData)
      
      expect(result.success).toBe(true)
      expect(supabase.from).toHaveBeenCalledWith('transacoes')
    })
  })

  describe('deleteTransaction', () => {
    it('should delete a transaction successfully', async () => {
      const mockDelete = vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      }))
      const mockFrom = vi.fn(() => ({ delete: mockDelete }))
      
      vi.mocked(supabase.from).mockImplementation(mockFrom)

      const result = await TransactionService.deleteTransaction(1)
      
      expect(result.success).toBe(true)
      expect(supabase.from).toHaveBeenCalledWith('transacoes')
    })
  })
})
