
import { ValidationError, NetworkError } from '@/utils/errorHandler'

export class TransactionValidation {
  static async validateTransactionServerSide(
    operation: string,
    data: any,
    token: string
  ) {
    try {
      // Usar URL e key diretamente das constantes
      const supabaseUrl = 'https://csvkgokkvbtojjkitodc.supabase.co'
      const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzdmtnb2trdmJ0b2pqa2l0b2RjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1OTE2NTIsImV4cCI6MjA2NTE2NzY1Mn0._pfTwbR3iLhqfJ--Tf6J8RD0lNQ8w8K9kzer8tY3ZDw'

      const response = await fetch(`${supabaseUrl}/functions/v1/validate-transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': supabaseKey,
        },
        body: JSON.stringify({
          operation,
          data
        })
      })

      const result = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          throw new ValidationError(result.error, 'rate_limit')
        }
        throw new ValidationError(result.error || 'Erro de validação', 'validation')
      }

      return result.data
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error
      }
      throw new NetworkError('Erro na validação server-side', 500, 'VALIDATION_ERROR')
    }
  }
}
