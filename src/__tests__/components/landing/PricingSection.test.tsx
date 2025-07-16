
import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import { PricingSection } from '@/components/landing/PricingSection'

describe('PricingSection Component', () => {
  it('should display correct pricing information', () => {
    const mockNavigateToPlano = vi.fn()
    
    render(<PricingSection onNavigateToPlano={mockNavigateToPlano} />)

    // Check if the correct price is displayed
    expect(screen.getByText('R$ 29,90')).toBeInTheDocument()
    expect(screen.getByText('/mês')).toBeInTheDocument()
    
    // Check if the plan name is displayed
    expect(screen.getByText('Plano Premium')).toBeInTheDocument()
    
    // Check if the free trial text is displayed
    expect(screen.getByText('7 dias grátis')).toBeInTheDocument()
  })

  it('should display all feature benefits', () => {
    const mockNavigateToPlano = vi.fn()
    
    render(<PricingSection onNavigateToPlano={mockNavigateToPlano} />)

    // Check if all features are listed
    const features = [
      'Dashboard completo com KPIs',
      'Transações ilimitadas',
      'Categorias personalizadas',
      'Lembretes inteligentes',
      'Relatórios detalhados',
      'Gráficos interativos',
      'Suporte premium',
      'Backup automático'
    ]

    features.forEach(feature => {
      expect(screen.getByText(feature)).toBeInTheDocument()
    })
  })

  it('should call onNavigateToPlano when Assinar Agora button is clicked', () => {
    const mockNavigateToPlano = vi.fn()
    
    render(<PricingSection onNavigateToPlano={mockNavigateToPlano} />)

    const subscribeButton = screen.getByText('Assinar Agora')
    fireEvent.click(subscribeButton)
    
    expect(mockNavigateToPlano).toHaveBeenCalledTimes(1)
  })

  it('should display security and activation badges', () => {
    const mockNavigateToPlano = vi.fn()
    
    render(<PricingSection onNavigateToPlano={mockNavigateToPlano} />)

    expect(screen.getByText('Pagamento Seguro')).toBeInTheDocument()
    expect(screen.getByText('Ativação Imediata')).toBeInTheDocument()
  })

  it('should have proper accessibility attributes', () => {
    const mockNavigateToPlano = vi.fn()
    
    render(<PricingSection onNavigateToPlano={mockNavigateToPlano} />)

    const subscribeButton = screen.getByRole('button', { name: /assinar plano premium agora/i })
    expect(subscribeButton).toBeInTheDocument()
    expect(subscribeButton).toHaveAttribute('aria-label', 'Assinar plano premium agora')
  })
})
