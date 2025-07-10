
import { supabase } from '@/lib/supabase'
import { ValidationError, NetworkError } from '@/utils/errorHandler'

export class XSSProtectionService {
  /**
   * Sanitiza dados no servidor antes de salvar
   */
  static async sanitizeData(
    operation: string,
    data: any,
    entityType: string
  ): Promise<any> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new ValidationError('Sessão inválida', 'auth')
      }

      const response = await fetch(
        `https://csvkgokkvbtojjkitodc.supabase.co/functions/v1/sanitize-data`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzdmtnb2trdmJ0b2pqa2l0b2RjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1OTE2NTIsImV4cCI6MjA2NTE2NzY1Mn0._pfTwbR3iLhqfJ--Tf6J8RD0lNQ8w8K9kzer8tY3ZDw',
          },
          body: JSON.stringify({
            operation,
            data,
            entityType
          })
        }
      )

      const result = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          throw new ValidationError(result.error, 'rate_limit')
        }
        if (response.status === 400) {
          throw new ValidationError(result.error, 'xss_detected')
        }
        throw new ValidationError(result.error || 'Erro de sanitização', 'validation')
      }

      return result.data
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error
      }
      throw new NetworkError('Erro na sanitização dos dados', 500, 'SANITIZATION_ERROR')
    }
  }
}
