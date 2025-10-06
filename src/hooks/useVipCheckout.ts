import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'

export function useVipCheckout() {
  const { session } = useAuth()

  const createVipCheckout = async () => {
    if (!session?.access_token) {
      toast.error("Erro de autenticação", {
        description: "Você precisa estar logado para acessar este plano.",
      })
      return
    }

    try {
      console.log('Creating VIP checkout session...')
      
      const { data, error } = await supabase.functions.invoke('create-checkout-vip', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (error) {
        console.error('VIP Checkout error:', error)
        toast.error("Erro ao processar pagamento", {
          description: "Não foi possível criar a sessão de pagamento VIP. Tente novamente.",
        })
        return
      }

      if (data?.url) {
        console.log('Redirecting to VIP checkout:', data.url)
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (error) {
      console.error('VIP Checkout error:', error)
      toast.error("Erro inesperado", {
        description: "Ocorreu um erro ao processar sua solicitação.",
      })
    }
  }

  return { createVipCheckout }
}
