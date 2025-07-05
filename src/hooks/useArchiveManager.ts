
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
      // Por enquanto, retornamos 0 para tudo até a migração ser aplicada
      return {
        transacoes: 0,
        lembretes: 0,
        categorias: 0
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
      // Por enquanto, apenas simulamos o arquivamento até a migração ser aplicada
      toast({
        title: 'Funcionalidade temporariamente indisponível',
        description: 'O arquivamento será habilitado após a migração do banco de dados.',
        variant: 'destructive'
      })

      return false
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
      // Buscar dados usando as colunas que realmente existem
      const [transacoesResult, lembretesResult, categoriasResult] = await Promise.all([
        supabase
          .from('transacoes')
          .select('*')
          .eq('userId', user.id),
        supabase
          .from('lembretes')
          .select('*')
          .eq('userId', user.id),
        supabase
          .from('categorias')
          .select('*')
          .eq('userid', user.id)
      ])

      const data = {
        user_id: user.id,
        exported_at: new Date().toISOString(),
        transacoes: transacoesResult.data || [],
        lembretes: lembretesResult.data || [],
        categorias: categoriasResult.data || []
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
