
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn()
    }
  }
}))

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
)

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    expect(result.current.loading).toBe(true)
    expect(result.current.user).toBeNull()
    expect(result.current.session).toBeNull()
  })

  it('should call signInWithPassword when signing in', async () => {
    const mockSignIn = vi.fn(() => Promise.resolve({ 
      data: { user: null, session: null },
      error: null 
    }))
    vi.mocked(supabase.auth.signInWithPassword).mockImplementation(mockSignIn)

    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await result.current.signIn('test@example.com', 'password123')
    
    expect(mockSignIn).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    })
  })

  it('should call signUp when registering', async () => {
    const mockSignUp = vi.fn(() => Promise.resolve({ 
      data: { user: null, session: null },
      error: null 
    }))
    vi.mocked(supabase.auth.signUp).mockImplementation(mockSignUp)

    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await result.current.signUp('test@example.com', 'password123', { nome: 'Test User' })
    
    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      options: {
        emailRedirectTo: expect.any(String),
        data: { nome: 'Test User' }
      }
    })
  })

  it('should handle sign out', async () => {
    const mockSignOut = vi.fn(() => Promise.resolve({ error: null }))
    vi.mocked(supabase.auth.signOut).mockImplementation(mockSignOut)

    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await result.current.signOut()
    
    expect(mockSignOut).toHaveBeenCalled()
  })
})
