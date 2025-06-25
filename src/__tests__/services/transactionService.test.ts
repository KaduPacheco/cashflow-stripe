
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

  describe('fetchTransactions', () => {
    it('should fetch transactions for a user', async () => {
      const mockData = [
        { id: '1', descricao: 'Test', valor: 100, tipo: 'receita' }
      ]
      
      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: mockData, error: null }))
          }))
        }))
      }))
      
      vi.mocked(supabase.from).mockImplementation(mockFrom)

      const result = await TransactionService.fetchTransactions('user-1')
      
      expect(result).toEqual(mockData)
      expect(supabase.from).toHaveBeenCalledWith('transacoes')
    })

    it('should throw error when fetch fails', async () => {
      const mockError = new Error('Database error')
      
      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: null, error: mockError }))
          }))
        }))
      }))
      
      vi.mocked(supabase.from).mockImplementation(mockFrom)

      await expect(TransactionService.fetchTransactions('user-1')).rejects.toThrow('Database error')
    })
  })

  describe('createTransaction', () => {
    it('should create a transaction successfully', async () => {
      const transactionData = {
        descricao: 'Test Transaction',
        valor: 100,
        tipo: 'receita' as const,
        category_id: 'cat-1',
        userId: 'user-1'
      }

      const mockInsert = vi.fn(() => Promise.resolve({ data: transactionData, error: null }))
      const mockFrom = vi.fn(() => ({ insert: mockInsert }))
      
      vi.mocked(supabase.from).mockImplementation(mockFrom)

      const result = await TransactionService.createTransaction(transactionData)
      
      expect(result).toEqual(transactionData)
      expect(supabase.from).toHaveBeenCalledWith('transacoes')
      expect(mockInsert).toHaveBeenCalledWith(transactionData)
    })
  })
})
