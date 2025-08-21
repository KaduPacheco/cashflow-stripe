
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import type { User, Session } from '@supabase/supabase-js'

export const createCheckout = async (user: User | null, session: Session | null) => {
  if (!user || !session?.access_token) {
    toast.error("Erro de autenticação", {
      description: "Você precisa estar logado para criar uma assinatura",
    })
    return
  }

  try {
    console.log('Creating checkout session for user:', user.id)
    
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    })
    
    if (error) {
      console.error('Error creating checkout:', error)
      throw error
    }

    if (data?.url) {
      console.log('Redirecting to checkout:', data.url)
      window.location.href = data.url
    } else {
      throw new Error('URL de checkout não retornada')
    }
    
  } catch (error: any) {
    console.error('Failed to create checkout:', error)
    toast.error("Erro ao criar checkout", {
      description: error.message || "Erro desconhecido ao criar sessão de pagamento",
    })
  }
}

export const openCustomerPortal = async (user: User | null, session: Session | null) => {
  if (!user || !session?.access_token) {
    toast.error("Erro de autenticação", {
      description: "Você precisa estar logado para acessar o portal do cliente",
    })
    return
  }

  try {
    console.log('Opening customer portal for user:', user.id)
    
    const { data, error } = await supabase.functions.invoke('customer-portal', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    })
    
    if (error) {
      console.error('Error opening customer portal:', error)
      throw error
    }

    if (data?.url) {
      console.log('Redirecting to customer portal:', data.url)
      window.open(data.url, '_blank')
      
      toast.success("Portal do cliente aberto", {
        description: "Você pode gerenciar sua assinatura na nova aba",
      })
    } else {
      throw new Error('URL do portal não retornada')
    }
  } catch (error: any) {
    console.error('Failed to open customer portal:', error)
    toast.error("Erro ao abrir portal do cliente", {
      description: error.message || "Erro desconhecido ao abrir portal",
    })
  }
}
