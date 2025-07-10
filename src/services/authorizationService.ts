import { supabase } from '@/integrations/supabase/client'
import { ValidationError, NetworkError } from '@/utils/errorHandler'

export class AuthorizationService {
  /**
   * Verifica autorização para operações críticas
   */
  static async verifyAuthorization(
    action: string,
    tableName: string,
    recordId?: string,
    data?: any
  ): Promise<{ success: boolean; userId?: string; error?: string }> {
    try {
      const { data: authResult, error } = await supabase.functions.invoke('verify-authorization', {
        body: {
          action,
          tableName,
          recordId,
          data
        }
      })

      if (error) {
        console.error('Authorization error:', error)
        return {
          success: false,
          error: 'Erro na verificação de autorização'
        }
      }

      if (!authResult.success) {
        return {
          success: false,
          error: authResult.error || 'Acesso negado'
        }
      }

      return {
        success: true,
        userId: authResult.userId
      }
    } catch (error) {
      console.error('Authorization service error:', error)
      return {
        success: false,
        error: 'Erro interno na verificação de autorização'
      }
    }
  }

  /**
   * Middleware para operações de update/delete
   */
  static async secureUpdate(
    tableName: string,
    recordId: string,
    updateData: any,
    updateFn: () => Promise<any>
  ) {
    const authResult = await this.verifyAuthorization('update', tableName, recordId, updateData)
    
    if (!authResult.success) {
      throw new ValidationError(authResult.error || 'Acesso negado', 'authorization')
    }

    return updateFn()
  }

  /**
   * Middleware para operações de delete
   */
  static async secureDelete(
    tableName: string,
    recordId: string,
    deleteFn: () => Promise<any>
  ) {
    const authResult = await this.verifyAuthorization('delete', tableName, recordId)
    
    if (!authResult.success) {
      throw new ValidationError(authResult.error || 'Acesso negado', 'authorization')
    }

    return deleteFn()
  }
}