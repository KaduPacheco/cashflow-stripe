
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'
import { Lembrete, LembreteFormData } from '@/types/lembrete'

export function useLembretes() {
  const { user } = useAuth()
  const [lembretes, setLembretes] = useState<Lembrete[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLembretes = async () => {
    try {
      const { data, error } = await supabase
        .from('lembretes')
        .select('*')
        .eq('userId', user?.id)
        .order('data', { ascending: true })

      if (error) throw error
      setLembretes(data || [])
    } catch (error: any) {
      toast({
        title: "Erro ao carregar lembretes",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getUserWhatsApp = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('whatsapp')
        .eq('id', user?.id)
        .single()

      if (error) throw error
      return data?.whatsapp || null
    } catch (error: any) {
      console.log('Erro ao buscar WhatsApp do usuário:', error.message)
      return null
    }
  }

  const createLembrete = async (formData: LembreteFormData) => {
    try {
      // Buscar o WhatsApp do usuário para auto-preenchimento
      const whatsappNumber = await getUserWhatsApp()

      const lembreteData = {
        descricao: formData.descricao,
        data: formData.data,
        valor: formData.valor ? parseFloat(formData.valor) : null,
        whatsapp: whatsappNumber,
        userId: user?.id,
        notificar_whatsapp: formData.notificar_whatsapp,
        data_envio_whatsapp: formData.data_envio_whatsapp || null,
        horario_envio_whatsapp: formData.horario_envio_whatsapp || null,
      }

      const { error } = await supabase
        .from('lembretes')
        .insert([lembreteData])

      if (error) throw error
      
      toast({ title: "Lembrete adicionado com sucesso!" })
      fetchLembretes()
    } catch (error: any) {
      toast({
        title: "Erro ao salvar lembrete",
        description: error.message,
        variant: "destructive",
      })
      throw error
    }
  }

  const updateLembrete = async (id: number, formData: LembreteFormData) => {
    try {
      // Buscar o WhatsApp atual do usuário para manter atualizado
      const whatsappNumber = await getUserWhatsApp()

      const lembreteData = {
        descricao: formData.descricao,
        data: formData.data,
        valor: formData.valor ? parseFloat(formData.valor) : null,
        whatsapp: whatsappNumber,
        userId: user?.id,
        notificar_whatsapp: formData.notificar_whatsapp,
        data_envio_whatsapp: formData.data_envio_whatsapp || null,
        horario_envio_whatsapp: formData.horario_envio_whatsapp || null,
      }

      const { error } = await supabase
        .from('lembretes')
        .update(lembreteData)
        .eq('id', id)

      if (error) throw error
      
      toast({ title: "Lembrete atualizado com sucesso!" })
      fetchLembretes()
    } catch (error: any) {
      toast({
        title: "Erro ao salvar lembrete",
        description: error.message,
        variant: "destructive",
      })
      throw error
    }
  }

  const scheduleWhatsAppNotification = async (id: number, date: string, time: string) => {
    try {
      const whatsappNumber = await getUserWhatsApp()

      const { error } = await supabase
        .from('lembretes')
        .update({
          notificar_whatsapp: true,
          data_envio_whatsapp: date,
          horario_envio_whatsapp: time,
          whatsapp: whatsappNumber
        })
        .eq('id', id)

      if (error) throw error
      
      fetchLembretes()
    } catch (error: any) {
      toast({
        title: "Erro ao agendar notificação",
        description: error.message,
        variant: "destructive",
      })
      throw error
    }
  }

  const deleteLembrete = async (id: number) => {
    try {
      const { error } = await supabase
        .from('lembretes')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      toast({ title: "Lembrete excluído com sucesso!" })
      fetchLembretes()
    } catch (error: any) {
      toast({
        title: "Erro ao excluir lembrete",
        description: error.message,
        variant: "destructive",
      })
      throw error
    }
  }

  const deleteAllLembretes = async () => {
    try {
      const { error } = await supabase
        .from('lembretes')
        .delete()
        .eq('userId', user?.id)

      if (error) throw error
      
      toast({ title: "Todos os lembretes foram excluídos com sucesso!" })
      fetchLembretes()
    } catch (error: any) {
      toast({
        title: "Erro ao excluir lembretes",
        description: error.message,
        variant: "destructive",
      })
      throw error
    }
  }

  useEffect(() => {
    if (user) {
      fetchLembretes()
    }
  }, [user])

  return {
    lembretes,
    loading,
    createLembrete,
    updateLembrete,
    deleteLembrete,
    deleteAllLembretes,
    scheduleWhatsAppNotification,
    refetch: fetchLembretes
  }
}
