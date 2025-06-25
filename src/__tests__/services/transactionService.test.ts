
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
        detalhes: 'Test transaction',
        quando: '2023-01-01'
      }

      // Mock the supabase.from().insert() chain
      const mockInsert = vi.fn(() => Promise.resolve({ data: transactionData, error: null }))
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert
      } as any)

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
        detalhes: 'Test transaction',
        quando: '2023-01-01'
      }

      const mockError = new Error('Database error')
      const mockInsert = vi.fn(() => Promise.resolve({ data: null, error: mockError }))
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert
      } as any)

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
        detalhes: 'Updated transaction',
        quando: '2023-01-02'
      }

      const mockEq = vi.fn(() => Promise.resolve({ data: transactionData, error: null }))
      const mockUpdate = vi.fn(() => ({ eq: mockEq }))
      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate
      } as any)

      const result = await TransactionService.updateTransaction(1, 'user-1', transactionData)
      
      expect(result.success).toBe(true)
      expect(supabase.from).toHaveBeenCalledWith('transacoes')
    })
  })

  describe('deleteTransaction', () => {
    it('should delete a transaction successfully', async () => {
      const mockEq = vi.fn(() => Promise.resolve({ error: null }))
      const mockDelete = vi.fn(() => ({ eq: mockEq }))
      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete
      } as any)

      const result = await TransactionService.deleteTransaction(1)
      
      expect(result.success).toBe(true)
      expect(supabase.from).toHaveBeenCalledWith('transacoes')
    })
  })
})
