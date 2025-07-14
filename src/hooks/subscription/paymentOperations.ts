
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
    console.log('Redirecting to Stripe payment link for user:', user.id)
    
    // Redirecionar diretamente para o link do Stripe fornecido
    const stripePaymentUrl = "https://buy.stripe.com/8x28wP2VbbfH5OjeDA2wU00"
    
    console.log('Redirecting to payment:', stripePaymentUrl)
    window.open(stripePaymentUrl, '_blank')
    
    toast.success("Redirecionando para pagamento", {
      description: "Abrindo nova aba com o pagamento do Stripe...",
    })
  } catch (error: any) {
    console.error('Failed to redirect to payment:', error)
    toast.error("Erro ao abrir página de pagamento", {
      description: error.message || "Erro desconhecido ao abrir pagamento",
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
    }
  } catch (error: any) {
    console.error('Failed to open customer portal:', error)
    toast.error("Erro ao abrir portal do cliente", {
      description: error.message || "Erro desconhecido ao abrir portal",
    })
  }
}
