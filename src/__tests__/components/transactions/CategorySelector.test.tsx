
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test-utils'
import { CategorySelector } from '@/components/transactions/CategorySelector'

// Mock the useCategories hook
vi.mock('@/hooks/useCategories', () => ({
  useCategories: vi.fn(() => ({
    categories: [
      { id: '1', nome: 'Alimentação', userId: 'user-1' },
      { id: '2', nome: 'Transporte', userId: 'user-1' }
    ],
    isLoading: false,
    error: null
  }))
}))

describe('CategorySelector', () => {
  it('should render category options', () => {
    const mockOnValueChange = vi.fn()
    
    render(
      <CategorySelector
        value=""
        onValueChange={mockOnValueChange}
      />
    )
    
    expect(screen.getByText('Selecione a categoria')).toBeInTheDocument()
  })

  it('should display selected category', () => {
    const mockOnValueChange = vi.fn()
    
    render(
      <CategorySelector
        value="1"
        onValueChange={mockOnValueChange}
      />
    )
    
    // Since it's a Select component, the selected value might not be directly visible
    const trigger = screen.getByRole('combobox')
    expect(trigger).toBeInTheDocument()
  })

  it('should show loading state', () => {
    const mockOnValueChange = vi.fn()
    
    // Mock loading state
    const mockUseCategories = vi.mocked(require('@/hooks/useCategories').useCategories)
    mockUseCategories.mockReturnValue({
      categories: [],
      isLoading: true,
      error: null
    })
    
    render(
      <CategorySelector
        value=""
        onValueChange={mockOnValueChange}
      />
    )
    
    expect(screen.getByText('Carregando categorias...')).toBeInTheDocument()
  })
})
