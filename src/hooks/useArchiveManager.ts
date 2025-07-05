
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import { toast } from './use-toast'

export function useArchiveManager() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const getArchivedCounts = async () => {
    if (!user?.id) return { transacoes: 0, lembretes: 0, categorias: 0 }

    try {
      const [transacoesResult, lembretesResult, categoriasResult] = await Promise.all([
        supabase
          .from('transacoes')
          .select('id', { count: 'exact' })
          .eq('userId', user.id)
          .eq('archived', true),
        supabase
          .from('lembretes')
          .select('id', { count: 'exact' })
          .eq('userId', user.id)
          .eq('archived', true),
        supabase
          .from('categorias')
          .select('id', { count: 'exact' })
          .eq('userId', user.id)
          .eq('archived', true)
      ])

      return {
        transacoes: transacoesResult.count || 0,
        lembretes: lembretesResult.count || 0,
        categorias: categoriasResult.count || 0
      }
    } catch (error) {
      console.error('Erro ao contar dados arquivados:', error)
      return { transacoes: 0, lembretes: 0, categorias: 0 }
    }
  }

  const bulkArchiveOldData = async (monthsOld: number = 12) => {
    if (!user?.id) return false

    setLoading(true)
    try {
      const cutoffDate = new Date()
      cutoffDate.setMonth(cutoffDate.getMonth() - monthsOld)

      const [transacoesResult, lembretesResult] = await Promise.all([
        supabase
          .from('transacoes')
          .update({ archived: true })
          .eq('userId', user.id)
          .eq('archived', false)
          .lt('created_at', cutoffDate.toISOString()),
        supabase
          .from('lembretes')
          .update({ archived: true })
          .eq('userId', user.id)
          .eq('archived', false)
          .lt('created_at', cutoffDate.toISOString())
      ])

      if (transacoesResult.error || lembretesResult.error) {
        throw new Error('Erro ao arquivar dados antigos')
      }

      toast({
        title: 'Dados arquivados!',
        description: `Dados com mais de ${monthsOld} meses foram arquivados.`
      })

      return true
    } catch (error) {
      console.error('Erro ao arquivar dados antigos:', error)
      toast({
        title: 'Erro ao arquivar dados',
        description: 'Não foi possível arquivar os dados antigos.',
        variant: 'destructive'
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  const exportUserData = async () => {
    if (!user?.id) return null

    setLoading(true)
    try {
      const { data, error } = await supabase.rpc('export_user_data', {
        user_id: user.id
      })

      if (error) {
        throw new Error(error.message)
      }

      // Criar e baixar arquivo JSON
      const dataStr = JSON.stringify(data, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
      
      const exportFileDefaultName = `cash-flow-backup-${new Date().toISOString().split('T')[0]}.json`
      
      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', exportFileDefaultName)
      linkElement.click()

      toast({
        title: 'Backup criado!',
        description: 'Seus dados foram exportados com sucesso.'
      })

      return data
    } catch (error) {
      console.error('Erro ao exportar dados:', error)
      toast({
        title: 'Erro ao exportar dados',
        description: 'Não foi possível criar o backup dos dados.',
        variant: 'destructive'
      })
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    getArchivedCounts,
    bulkArchiveOldData,
    exportUserData
  }
}
