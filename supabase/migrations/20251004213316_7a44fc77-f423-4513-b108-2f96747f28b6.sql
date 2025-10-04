-- FASE 1: Correção Crítica de Segurança - RLS da tabela subscribers
-- Remove política insegura que permite qualquer usuário inserir qualquer subscription

-- 1. Remover política perigosa
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;

-- 2. Criar política segura que valida ownership
CREATE POLICY "Users can only insert their own subscription"
ON public.subscribers
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() AND
  email = auth.email()
);