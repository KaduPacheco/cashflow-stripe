
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createCheckout } from '@/hooks/subscription/paymentOperations'

// Mock window.open
const mockWindowOpen = vi.fn()
Object.defineProperty(window, 'open', {
  writable: true,
  value: mockWindowOpen,
})

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  }
}))

describe('Payment Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createCheckout', () => {
    it('should redirect to correct Stripe payment link with valid user and session', async () => {
      const mockUser = { id: 'test-user', email: 'test@example.com' }
      const mockSession = { access_token: 'test-token' }

      await createCheckout(mockUser as any, mockSession as any)

      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://buy.stripe.com/28E4gz67n2JbfoT2US2wU02',
        '_blank'
      )
    })

    it('should show error when user is not provided', async () => {
      const { toast } = await import('sonner')
      
      await createCheckout(null, null)

      expect(toast.error).toHaveBeenCalledWith(
        'Erro de autenticação',
        {
          description: 'Você precisa estar logado para criar uma assinatura',
        }
      )
      
      expect(mockWindowOpen).not.toHaveBeenCalled()
    })

    it('should show error when session is not provided', async () => {
      const { toast } = await import('sonner')
      const mockUser = { id: 'test-user', email: 'test@example.com' }
      
      await createCheckout(mockUser as any, null)

      expect(toast.error).toHaveBeenCalledWith(
        'Erro de autenticação',
        {
          description: 'Você precisa estar logado para criar uma assinatura',
        }
      )
      
      expect(mockWindowOpen).not.toHaveBeenCalled()
    })

    it('should show error when session has no access token', async () => {
      const { toast } = await import('sonner')
      const mockUser = { id: 'test-user', email: 'test@example.com' }
      const mockSession = { access_token: null }
      
      await createCheckout(mockUser as any, mockSession as any)

      expect(toast.error).toHaveBeenCalledWith(
        'Erro de autenticação',
        {
          description: 'Você precisa estar logado para criar uma assinatura',
        }
      )
      
      expect(mockWindowOpen).not.toHaveBeenCalled()
    })
  })
})
