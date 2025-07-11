
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import { toast } from '@/hooks/use-toast'

const DEMO_CATEGORIES = [
  { nome: 'Alimentação', tags: 'demo' },
  { nome: 'Transporte', tags: 'demo' },
  { nome: 'Salário', tags: 'demo' },
  { nome: 'Freelance', tags: 'demo' },
]

const DEMO_TRANSACTIONS = [
  {
    estabelecimento: 'Supermercado Central',
    valor: 150.50,
    tipo: 'despesa',
    detalhes: 'Compras da semana - dados de exemplo',
    quando: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 dias atrás
  },
  {
    estabelecimento: 'Posto de Gasolina',
    valor: 80.00,
    tipo: 'despesa',
    detalhes: 'Combustível - dados de exemplo',
    quando: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 dia atrás
  },
  {
    estabelecimento: 'Empresa XYZ',
    valor: 3500.00,
    tipo: 'receita',
    detalhes: 'Salário mensal - dados de exemplo',
    quando: new Date().toISOString().split('T')[0], // hoje
  },
  {
    estabelecimento: 'Projeto Freelance',
    valor: 800.00,
    tipo: 'receita',
    detalhes: 'Trabalho extra - dados de exemplo',
    quando: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 dias atrás
  },
]

const DEMO_REMINDERS = [
  {
    descricao: 'Pagar conta de luz - lembrete de exemplo',
    data: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // em 3 dias
    valor: 85.00,
  },
  {
    descricao: 'Vencimento cartão de crédito - lembrete de exemplo',
    data: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // em 7 dias
    valor: 450.00,
  },
]

export function useDemoData() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const loadDemoData = async () => {
    if (!user) return

    setLoading(true)
    
    try {
      // 1. Criar categorias de exemplo
      const { data: categories, error: categoriesError } = await supabase
        .from('categorias')
        .insert(
          DEMO_CATEGORIES.map(cat => ({
            ...cat,
            userid: user.id
          })) as any
        )
        .select()

      if (categoriesError) throw categoriesError

      // 2. Criar transações de exemplo
      const transactionsWithCategories = DEMO_TRANSACTIONS.map((transaction, index) => ({
        ...transaction,
        userId: user.id,
        category_id: (categories as any)?.[index % (categories as any)?.length]?.id,
      }))

      const { error: transactionsError } = await supabase
        .from('transacoes')
        .insert(transactionsWithCategories as any)

      if (transactionsError) throw transactionsError

      // 3. Criar lembretes de exemplo
      const { error: remindersError } = await supabase
        .from('lembretes')
        .insert(
          DEMO_REMINDERS.map(reminder => ({
            ...reminder,
            userId: user.id,
          })) as any
        )

      if (remindersError) throw remindersError

      toast({
        title: "Dados de exemplo carregados!",
        description: "Explore o app com transações, categorias e lembretes de demonstração.",
      })

    } catch (error: any) {
      console.error('Erro ao carregar dados de exemplo:', error)
      toast({
        title: "Erro ao carregar dados de exemplo",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const clearDemoData = async () => {
    if (!user) return

    setLoading(true)
    
    try {
      // Remover dados marcados como demo
      await Promise.all([
        supabase.from('transacoes').delete().eq('userId', user.id).like('detalhes', '% - dados de exemplo'),
        supabase.from('lembretes').delete().eq('userId', user.id).like('descricao', '% - lembrete de exemplo'),
        supabase.from('categorias').delete().eq('userid', user.id).eq('tags', 'demo' as any),
      ])

      toast({
        title: "Dados de exemplo removidos",
        description: "Agora você pode adicionar seus próprios dados.",
      })

    } catch (error: any) {
      console.error('Erro ao limpar dados de exemplo:', error)
      toast({
        title: "Erro ao limpar dados de exemplo",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return {
    loadDemoData,
    clearDemoData,
    loading,
  }
}
