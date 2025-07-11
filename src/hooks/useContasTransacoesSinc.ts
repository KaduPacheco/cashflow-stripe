
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import type { ContaPagarReceber } from '@/types/contas'

export function useContasTransacoesSinc() {
  const { user } = useAuth()

  const criarTransacaoFromConta = async (conta: ContaPagarReceber, valorPago: number, dataPagamento: string) => {
    if (!user) {
      console.error('Usuário não autenticado')
      return null
    }

    try {
      // Determinar o tipo da transação baseado no tipo da conta
      const tipoTransacao = conta.tipo === 'pagar' ? 'despesa' : 'receita'
      
      // Usar o nome do cliente/fornecedor como estabelecimento ou uma descrição padrão
      const estabelecimento = conta.clientes_fornecedores?.nome || 
                             (conta.tipo === 'pagar' ? 'Pagamento de conta' : 'Recebimento de conta')

      // Criar a transação
      const transacaoData = {
        userId: user.id,
        quando: new Date(dataPagamento).toISOString(),
        estabelecimento: estabelecimento,
        valor: valorPago,
        detalhes: `${conta.tipo === 'pagar' ? 'Pagamento' : 'Recebimento'}: ${conta.descricao}`,
        tipo: tipoTransacao,
        category_id: conta.category_id || null
      }

      const { data, error } = await supabase
        .from('transacoes')
        .insert([transacaoData] as any)
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar transação:', error)
        toast.error('Erro ao criar transação automática')
        return null
      }

      // Notificar o usuário sobre a criação da transação
      toast.success(
        `${tipoTransacao === 'despesa' ? 'Despesa' : 'Receita'} criada automaticamente no dashboard!`,
        {
          action: {
            label: 'Ver transações',
            onClick: () => window.location.href = '/transacoes'
          }
        }
      )

      return data
    } catch (error) {
      console.error('Erro ao sincronizar conta com transação:', error)
      toast.error('Erro ao criar transação automática')
      return null
    }
  }

  return {
    criarTransacaoFromConta
  }
}
