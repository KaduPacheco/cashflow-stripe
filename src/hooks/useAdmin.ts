
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { SecureLogger } from '@/lib/logger'

export function useAdmin() {
  const { user, session } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAdminStatus()
  }, [user, session])

  const checkAdminStatus = async () => {
    try {
      if (!user || !session) {
        setIsAdmin(false)
        setIsLoading(false)
        return
      }

      // Verificação dupla: email específico + status admin no banco
      const isAdminEmail = user.email === 'adm.forteia@gmail.com'
      
      if (!isAdminEmail) {
        setIsAdmin(false)
        setIsLoading(false)
        return
      }

      // Verificar no banco se o usuário tem is_admin = true
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (error) {
        SecureLogger.error('Erro ao verificar status admin', error)
        setIsAdmin(false)
        setIsLoading(false)
        return
      }

      const adminStatus = profile?.is_admin === true
      setIsAdmin(adminStatus)
      
      // Log de acesso administrativo
      if (adminStatus) {
        SecureLogger.info('Acesso administrativo verificado', { 
          userId: user.id, 
          email: user.email 
        })
      }

    } catch (error) {
      SecureLogger.error('Erro na verificação de admin', error)
      setIsAdmin(false)
    } finally {
      setIsLoading(false)
    }
  }

  const logAdminAction = async (action: string, details?: any) => {
    if (!isAdmin) return

    try {
      await supabase.rpc('log_admin_action', {
        p_action: action,
        p_details: details ? JSON.stringify(details) : null
      })
    } catch (error) {
      SecureLogger.error('Erro ao registrar ação admin', error)
    }
  }

  return {
    isAdmin,
    isLoading,
    logAdminAction
  }
}
