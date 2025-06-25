
import { http, HttpResponse } from 'msw'

export const handlers = [
  // Mock Supabase auth endpoints
  http.post('*/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'mock-access-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh-token',
      user: {
        id: 'mock-user-id',
        email: 'test@example.com',
        created_at: '2023-01-01T00:00:00Z'
      }
    })
  }),

  // Mock Supabase functions
  http.post('*/functions/v1/check-subscription', () => {
    return HttpResponse.json({
      subscribed: true,
      subscription_tier: 'Premium',
      subscription_end: '2024-12-31T23:59:59Z'
    })
  }),

  // Mock database queries
  http.get('*/rest/v1/transacoes', () => {
    return HttpResponse.json([
      {
        id: '1',
        estabelecimento: 'Test Transaction',
        valor: 100.50,
        tipo: 'receita',
        quando: '2023-01-01T00:00:00Z',
        category_id: 'cat-1',
        userId: 'user-1'
      }
    ])
  }),

  http.get('*/rest/v1/categorias', () => {
    return HttpResponse.json([
      {
        id: 'cat-1',
        nome: 'Test Category',
        userId: 'user-1'
      }
    ])
  })
]
