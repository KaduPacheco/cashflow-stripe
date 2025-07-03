
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Category {
  id: string;
  nome: string;
  tags: string | null;
  created_at: string;
  updated_at: string;
  userid: string;
}

export function useCategories() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['categories', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .eq('userid', user.id)
        .order('nome');

      if (error) {
        console.error('Erro ao buscar categorias:', error);
        throw error;
      }

      return data as Category[];
    },
    enabled: !!user?.id,
  });

  // Função para verificar duplicatas
  const checkDuplicateCategory = async (nome: string): Promise<boolean> => {
    if (!user?.id) return false;

    const { data, error } = await supabase
      .from('categorias')
      .select('id')
      .eq('userid', user.id)
      .ilike('nome', nome.trim());

    if (error) {
      console.error('Erro ao verificar duplicata:', error);
      return false;
    }

    return data && data.length > 0;
  };

  const createCategory = useMutation({
    mutationFn: async (newCategory: { nome: string; tags?: string }) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const trimmedName = newCategory.nome.trim();
      
      // Verificar duplicata
      const isDuplicate = await checkDuplicateCategory(trimmedName);
      if (isDuplicate) {
        throw new Error('Essa categoria já existe');
      }

      const { data, error } = await supabase
        .from('categorias')
        .insert([
          {
            nome: trimmedName,
            tags: newCategory.tags || null,
            userid: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoria criada com sucesso!');
    },
    onError: (error: Error) => {
      console.error('Erro ao criar categoria:', error);
      toast.error(error.message || 'Erro ao criar categoria');
    },
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: { nome: string; tags?: string } }) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const trimmedName = updates.nome.trim();
      
      // Verificar duplicata apenas se o nome foi alterado
      const currentCategory = categories.find(cat => cat.id === id);
      if (currentCategory && currentCategory.nome.toLowerCase() !== trimmedName.toLowerCase()) {
        const isDuplicate = await checkDuplicateCategory(trimmedName);
        if (isDuplicate) {
          throw new Error('Essa categoria já existe');
        }
      }

      const { data, error } = await supabase
        .from('categorias')
        .update({
          nome: trimmedName,
          tags: updates.tags || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('userid', user.id) // Garantir que só atualize categorias do usuário atual
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoria atualizada com sucesso!');
    },
    onError: (error: Error) => {
      console.error('Erro ao atualizar categoria:', error);
      toast.error(error.message || 'Erro ao atualizar categoria');
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      if (!id) throw new Error('ID da categoria é obrigatório');

      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id)
        .eq('userid', user.id); // Garantir que só delete categorias do usuário atual

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoria excluída com sucesso!');
    },
    onError: (error: Error) => {
      console.error('Erro ao excluir categoria:', error);
      toast.error(`Erro ao excluir categoria: ${error.message}`);
    },
  });

  return {
    categories,
    isLoading,
    error,
    createCategory: createCategory.mutate,
    updateCategory: updateCategory.mutate,
    deleteCategory: deleteCategory.mutate,
    isCreating: createCategory.isPending,
    isUpdating: updateCategory.isPending,
    isDeleting: deleteCategory.isPending,
  };
}
