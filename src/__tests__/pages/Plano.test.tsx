
import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Plano from '@/pages/Plano'

// Mock window.open
const mockWindowOpen = vi.fn()
Object.defineProperty(window, 'open', {
  writable: true,
  value: mockWindowOpen,
})

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
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

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

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

describe('Plano Page Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display all pricing information correctly', () => {
    render(
      <TestWrapper>
        <Plano />
      </TestWrapper>
    )

    // Check main title with price
    expect(screen.getByText('Plano Agente Financeiro – R$ 29,90/mês')).toBeInTheDocument()
    
    // Check value proposition
    expect(screen.getByText('Invista no controle da sua vida financeira por menos de R$ 1 por dia!')).toBeInTheDocument()
    
    // Check benefits list
    expect(screen.getByText('Registre gastos e receitas automaticamente')).toBeInTheDocument()
    expect(screen.getByText('Receba lembretes de contas e metas')).toBeInTheDocument()
    expect(screen.getByText('Tenha um assistente sempre pronto para ajudar')).toBeInTheDocument()
  })

  it('should handle subscription button click correctly', () => {
    render(
      <TestWrapper>
        <Plano />
      </TestWrapper>
    )

    const subscribeButton = screen.getByText('Assinar agora')
    expect(subscribeButton).toBeInTheDocument()
    
    fireEvent.click(subscribeButton)
    
    // Verify that the createCheckout function was called (which opens the Stripe link)
    expect(mockWindowOpen).toHaveBeenCalledWith(
      'https://buy.stripe.com/28E4gz67n2JbfoT2US2wU02',
      '_blank'
    )
  })

  it('should handle back to login navigation', () => {
    render(
      <TestWrapper>
        <Plano />
      </TestWrapper>
    )

    const backButton = screen.getByText('Voltar ao login')
    fireEvent.click(backButton)
    
    expect(mockNavigate).toHaveBeenCalledWith('/auth')
  })

  it('should display checkout canceled message when coming from canceled checkout', () => {
    // Mock URL search params
    delete window.location
    window.location = { 
      search: '?checkout=canceled',
      pathname: '/plano'
    } as any

    render(
      <TestWrapper>
        <Plano />
      </TestWrapper>
    )

    expect(screen.getByText('Pagamento cancelado. Você pode tentar novamente quando quiser.')).toBeInTheDocument()
  })
})
