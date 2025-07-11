
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import { useDebounce } from './useDebounce'

interface Lembrete {
  id: number
  descricao: string | null
  data: string | null
  valor: number | null
  whatsapp: string | null
}

interface UseLembretesDoDiaReturn {
  lembretesDoDia: Lembrete[]
  isLoading: boolean
  error: string | null
}

export function useLembretesDoDia(): UseLembretesDoDiaReturn {
  const { user } = useAuth()
  const [lembretesDoDia, setLembretesDoDia] = useState<Lembrete[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLembretesDoDia = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const hoje = new Date().toISOString().split('T')[0]

      const { data: lembretes, error: lembretesError } = await supabase
        .from('lembretes')
        .select('id, descricao, data, valor, whatsapp')
        .eq('userId', user.id)
        .eq('data', hoje)
        .order('data', { ascending: true })

      if (lembretesError) throw lembretesError

      setLembretesDoDia(lembretes || [])
    } catch (err: any) {
      console.error('❌ useLembretesDoDia - Erro:', err)
      setError(err.message || 'Erro ao carregar lembretes do dia')
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  const debouncedFetchLembretesDoDia = useDebounce(fetchLembretesDoDia, 300)

  useEffect(() => {
    if (user?.id) {
      fetchLembretesDoDia()
    }
  }, [user?.id])

  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel('lembretes-do-dia-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lembretes',
          filter: `userId=eq.${user.id}`
        },
        () => {
          debouncedFetchLembretesDoDia()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, debouncedFetchLembretesDoDia])

  return {
    lembretesDoDia,
    isLoading,
    error
  }
}
