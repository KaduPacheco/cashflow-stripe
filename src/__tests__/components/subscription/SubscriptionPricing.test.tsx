
import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PricingSection } from '@/components/landing/PricingSection'
import { SubscriptionGate } from '@/components/subscription/SubscriptionGate'
import Plano from '@/pages/Plano'

// Mock window.open
const mockWindowOpen = vi.fn()
Object.defineProperty(window, 'open', {
  writable: true,
  value: mockWindowOpen,
})

// Mock hooks
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user', email: 'test@example.com' },
    session: { access_token: 'test-token' },
    signOut: vi.fn()
  })
}))

vi.mock('@/hooks/useSubscription', () => ({
  useSubscription: () => ({
    subscriptionData: { subscribed: false },
    loading: false,
    createCheckout: mockWindowOpen,
    checkSubscription: vi.fn(),
  })
}))

vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({ theme: 'light' })
}))

vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => false
}))

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('Subscription Pricing Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('PricingSection Component', () => {
    it('should display correct price R$ 29,90/mês', () => {
      const mockNavigateToPlano = vi.fn()
      
      render(
        <TestWrapper>
          <PricingSection onNavigateToPlano={mockNavigateToPlano} />
        </TestWrapper>
      )

      expect(screen.getByText('R$ 29,90')).toBeInTheDocument()
      expect(screen.getByText('/mês')).toBeInTheDocument()
    })

    it('should navigate to plano page when clicking Assinar Agora', () => {
      const mockNavigateToPlano = vi.fn()
      
      render(
        <TestWrapper>
          <PricingSection onNavigateToPlano={mockNavigateToPlano} />
        </TestWrapper>
      )

      const subscribeButton = screen.getByText('Assinar Agora')
      fireEvent.click(subscribeButton)
      
      expect(mockNavigateToPlano).toHaveBeenCalled()
    })
  })

  describe('Plano Page', () => {
    it('should display correct price R$ 29,90/mês in title', () => {
      render(
        <TestWrapper>
          <Plano />
        </TestWrapper>
      )

      expect(screen.getByText('Plano Agente Financeiro – R$ 29,90/mês')).toBeInTheDocument()
    })

    it('should display value proposition message with less than R$ 1 per day', () => {
      render(
        <TestWrapper>
          <Plano />
        </TestWrapper>
      )

      expect(screen.getByText('Invista no controle da sua vida financeira por menos de R$ 1 por dia!')).toBeInTheDocument()
    })

    it('should redirect to correct Stripe link when clicking Assinar agora', () => {
      render(
        <TestWrapper>
          <Plano />
        </TestWrapper>
      )

      const subscribeButton = screen.getByText('Assinar agora')
      fireEvent.click(subscribeButton)
      
      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://buy.stripe.com/28E4gz67n2JbfoT2US2wU02',
        '_blank'
      )
    })
  })

  describe('SubscriptionGate Component', () => {
    it('should display correct price R$ 29,90/mês when not subscribed', () => {
      render(
        <TestWrapper>
          <SubscriptionGate>
            <div>Protected Content</div>
          </SubscriptionGate>
        </TestWrapper>
      )

      expect(screen.getByText('R$ 29,90/mês')).toBeInTheDocument()
      expect(screen.getByText('Plano Agente Financeiro')).toBeInTheDocument()
    })

    it('should redirect to correct Stripe link when clicking Assinar Agora in gate', () => {
      render(
        <TestWrapper>
          <SubscriptionGate>
            <div>Protected Content</div>
          </SubscriptionGate>
        </TestWrapper>
      )

      const subscribeButton = screen.getByText('Assinar Agora')
      fireEvent.click(subscribeButton)
      
      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://buy.stripe.com/28E4gz67n2JbfoT2US2wU02',
        '_blank'
      )
    })
  })
})
