
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test-utils'
import { CategorySelector } from '@/components/transactions/CategorySelector'

// Mock the useCategories hook
vi.mock('@/hooks/useCategories', () => ({
  useCategories: () => ({
    categories: [
      { id: '1', nome: 'Alimentação', userId: 'user-1' },
      { id: '2', nome: 'Transporte', userId: 'user-1' }
    ],
    loading: false,
    error: null
  })
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
    
    expect(screen.getByText('Selecione uma categoria')).toBeInTheDocument()
  })

  it('should display selected category', () => {
    const mockOnValueChange = vi.fn()
    
    render(
      <CategorySelector
        value="1"
        onValueChange={mockOnValueChange}
      />
    )
    
    expect(screen.getByDisplayValue('Alimentação')).toBeInTheDocument()
  })

  it('should call onValueChange when category is selected', async () => {
    const mockOnValueChange = vi.fn()
    
    render(
      <CategorySelector
        value=""
        onValueChange={mockOnValueChange}
      />
    )
    
    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)
    
    const option = screen.getByText('Transporte')
    fireEvent.click(option)
    
    expect(mockOnValueChange).toHaveBeenCalledWith('2')
  })
})
