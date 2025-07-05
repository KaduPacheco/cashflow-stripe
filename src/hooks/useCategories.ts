
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import { toast } from './use-toast'

interface Category {
  id: string
  userId: string
  nome: string
  tags?: string
  created_at: string
  updated_at: string
  archived: boolean
}

export function useCategories() {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCategories = async (includeArchived: boolean = false) => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    try {
      let query = supabase
        .from('categorias')
        .select('*')
        .eq('userId', user.id)

      // Filtrar arquivados por padrão
      if (!includeArchived) {
        query = query.eq('archived', false)
      }

      query = query.order('nome')

      const { data, error } = await query

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

  const createCategory = async (nome: string, tags?: string) => {
    if (!user?.id) return null

    try {
      const { data, error } = await supabase
        .from('categorias')
        .insert([{
          userId: user.id,
          nome,
          tags,
          archived: false
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
        description: `A categoria "${nome}" foi criada.`
      })

      return data
    } catch (error) {
      console.error('Erro inesperado:', error)
      toast({
        title: 'Erro inesperado',
        description: 'Erro ao criar categoria',
        variant: 'destructive'
      })
      return null
    }
  }

  const updateCategory = async (id: string, nome: string, tags?: string) => {
    if (!user?.id) return null

    try {
      const { data, error } = await supabase
        .from('categorias')
        .update({ nome, tags })
        .eq('id', id)
        .eq('userId', user.id)
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
        description: `A categoria "${nome}" foi atualizada.`
      })

      return data
    } catch (error) {
      console.error('Erro inesperado:', error)
      toast({
        title: 'Erro inesperado',
        description: 'Erro ao atualizar categoria',
        variant: 'destructive'
      })
      return null
    }
  }

  const deleteCategory = async (id: string) => {
    if (!user?.id) return false

    try {
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id)
        .eq('userId', user.id)

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
    }
  }

  // Nova função para arquivar categoria
  const archiveCategory = async (id: string) => {
    if (!user?.id) return false

    try {
      const { error } = await supabase
        .from('categorias')
        .update({ archived: true })
        .eq('id', id)
        .eq('userId', user.id)

      if (error) {
        console.error('Erro ao arquivar categoria:', error)
        toast({
          title: 'Erro ao arquivar categoria',
          description: error.message,
          variant: 'destructive'
        })
        return false
      }

      await fetchCategories()
      toast({
        title: 'Categoria arquivada!',
        description: 'A categoria foi arquivada com sucesso.'
      })

      return true
    } catch (error) {
      console.error('Erro inesperado:', error)
      toast({
        title: 'Erro inesperado',
        description: 'Erro ao arquivar categoria',
        variant: 'destructive'
      })
      return false
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [user?.id])

  return {
    categories,
    loading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    archiveCategory
  }
}
