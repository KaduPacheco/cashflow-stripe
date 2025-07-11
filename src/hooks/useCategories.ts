
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import { toast } from './use-toast'

export interface Category {
  id: string
  userid: string
  nome: string
  tags?: string
  created_at: string
  updated_at: string
}

export function useCategories() {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchCategories = async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .eq('userid', user.id)
        .order('nome')

      if (error) {
        console.error('Erro ao buscar categorias:', error)
        toast({
          title: 'Erro ao carregar categorias',
          description: error.message,
          variant: 'destructive'
        })
        return
      }

      setCategories(data || [])
    } catch (error) {
      console.error('Erro inesperado:', error)
      toast({
        title: 'Erro inesperado',
        description: 'Erro ao carregar categorias',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const createCategory = async (data: { nome: string; tags?: string }) => {
    if (!user?.id) return null

    setIsCreating(true)
    try {
      const { data: category, error } = await supabase
        .from('categorias')
        .insert([{
          userid: user.id,
          nome: data.nome,
          tags: data.tags
        }])
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar categoria:', error)
        toast({
          title: 'Erro ao criar categoria',
          description: error.message,
          variant: 'destructive'
        })
        return null
      }

      await fetchCategories()
      toast({
        title: 'Categoria criada com sucesso!',
        description: `A categoria "${data.nome}" foi criada.`
      })

      return category
    } catch (error) {
      console.error('Erro inesperado:', error)
      toast({
        title: 'Erro inesperado',
        description: 'Erro ao criar categoria',
        variant: 'destructive'
      })
      return null
    } finally {
      setIsCreating(false)
    }
  }

  const updateCategory = async (data: { id: string; updates: { nome: string; tags?: string } }) => {
    if (!user?.id) return null

    setIsUpdating(true)
    try {
      const { data: category, error } = await supabase
        .from('categorias')
        .update({ nome: data.updates.nome, tags: data.updates.tags })
        .eq('id', data.id)
        .eq('userid', user.id)
        .select()
        .single()

      if (error) {
        console.error('Erro ao atualizar categoria:', error)
        toast({
          title: 'Erro ao atualizar categoria',
          description: error.message,
          variant: 'destructive'
        })
        return null
      }

      await fetchCategories()
      toast({
        title: 'Categoria atualizada!',
        description: `A categoria "${data.updates.nome}" foi atualizada.`
      })

      return category
    } catch (error) {
      console.error('Erro inesperado:', error)
      toast({
        title: 'Erro inesperado',
        description: 'Erro ao atualizar categoria',
        variant: 'destructive'
      })
      return null
    } finally {
      setIsUpdating(false)
    }
  }

  const deleteCategory = async (id: string) => {
    if (!user?.id) return false

    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id)
        .eq('userid', user.id)

      if (error) {
        console.error('Erro ao excluir categoria:', error)
        toast({
          title: 'Erro ao excluir categoria',
          description: error.message,
          variant: 'destructive'
        })
        return false
      }

      await fetchCategories()
      toast({
        title: 'Categoria excluída!',
        description: 'A categoria foi removida com sucesso.'
      })

      return true
    } catch (error) {
      console.error('Erro inesperado:', error)
      toast({
        title: 'Erro inesperado',
        description: 'Erro ao excluir categoria',
        variant: 'destructive'
      })
      return false
    } finally {
      setIsDeleting(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [user?.id])

  return {
    categories,
    loading,
    isLoading: loading, // Alias para compatibilidade
    isCreating,
    isUpdating,
    isDeleting,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory
  }
}
