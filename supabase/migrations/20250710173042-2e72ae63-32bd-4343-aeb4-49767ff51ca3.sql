-- Auditoria completa de RLS e autorização avançada
-- Data: 2025-01-10

-- 1. Verificar e garantir que RLS está habilitado em todas as tabelas sensíveis
ALTER TABLE public.transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lembretes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contas_pagar_receber ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes_fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- 2. Recriar políticas mais restritivas para transacoes
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transacoes;
DROP POLICY IF EXISTS "Users can create own transactions" ON public.transacoes;
DROP POLICY IF EXISTS "Users can update own transactions" ON public.transacoes;
DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transacoes;

CREATE POLICY "transacoes_select_policy" ON public.transacoes
  FOR SELECT TO authenticated
  USING (auth.uid() = "userId");

CREATE POLICY "transacoes_insert_policy" ON public.transacoes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = "userId");

CREATE POLICY "transacoes_update_policy" ON public.transacoes
  FOR UPDATE TO authenticated
  USING (auth.uid() = "userId")
  WITH CHECK (auth.uid() = "userId");

CREATE POLICY "transacoes_delete_policy" ON public.transacoes
  FOR DELETE TO authenticated
  USING (auth.uid() = "userId");

-- 3. Recriar políticas mais restritivas para lembretes  
DROP POLICY IF EXISTS "Users can view own reminders" ON public.lembretes;
DROP POLICY IF EXISTS "Users can create own reminders" ON public.lembretes;
DROP POLICY IF EXISTS "Users can update own reminders" ON public.lembretes;
DROP POLICY IF EXISTS "Users can delete own reminders" ON public.lembretes;

CREATE POLICY "lembretes_select_policy" ON public.lembretes
  FOR SELECT TO authenticated
  USING (auth.uid() = "userId");

CREATE POLICY "lembretes_insert_policy" ON public.lembretes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = "userId");

CREATE POLICY "lembretes_update_policy" ON public.lembretes
  FOR UPDATE TO authenticated
  USING (auth.uid() = "userId")
  WITH CHECK (auth.uid() = "userId");

CREATE POLICY "lembretes_delete_policy" ON public.lembretes
  FOR DELETE TO authenticated
  USING (auth.uid() = "userId");

-- 4. Recriar políticas mais restritivas para categorias
DROP POLICY IF EXISTS "Users can view own categories" ON public.categorias;
DROP POLICY IF EXISTS "Users can create own categories" ON public.categorias;
DROP POLICY IF EXISTS "Users can update own categories" ON public.categorias;
DROP POLICY IF EXISTS "Users can delete own categories" ON public.categorias;

CREATE POLICY "categorias_select_policy" ON public.categorias
  FOR SELECT TO authenticated
  USING (auth.uid() = "userId");

CREATE POLICY "categorias_insert_policy" ON public.categorias
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = "userId");

CREATE POLICY "categorias_update_policy" ON public.categorias
  FOR UPDATE TO authenticated
  USING (auth.uid() = "userId")
  WITH CHECK (auth.uid() = "userId");

CREATE POLICY "categorias_delete_policy" ON public.categorias
  FOR DELETE TO authenticated
  USING (auth.uid() = "userId");

-- 5. Garantir que perfis são seguros
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_insert_policy" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- 6. Criar função para verificação de ownership em edge functions
CREATE OR REPLACE FUNCTION public.verify_user_ownership(
  table_name text,
  record_id uuid,
  user_id_field text DEFAULT 'userId'
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result boolean := false;
  query_text text;
BEGIN
  -- Construir query dinamicamente baseada na tabela
  CASE table_name
    WHEN 'transacoes' THEN
      SELECT EXISTS(
        SELECT 1 FROM public.transacoes 
        WHERE id = record_id::bigint AND "userId" = auth.uid()
      ) INTO result;
    WHEN 'lembretes' THEN
      SELECT EXISTS(
        SELECT 1 FROM public.lembretes 
        WHERE id = record_id::bigint AND "userId" = auth.uid()
      ) INTO result;
    WHEN 'categorias' THEN
      SELECT EXISTS(
        SELECT 1 FROM public.categorias 
        WHERE id = record_id AND "userId" = auth.uid()
      ) INTO result;
    WHEN 'contas_pagar_receber' THEN
      SELECT EXISTS(
        SELECT 1 FROM public.contas_pagar_receber 
        WHERE id = record_id AND user_id = auth.uid()
      ) INTO result;
    WHEN 'clientes_fornecedores' THEN
      SELECT EXISTS(
        SELECT 1 FROM public.clientes_fornecedores 
        WHERE id = record_id AND user_id = auth.uid()
      ) INTO result;
    ELSE
      result := false;
  END CASE;
  
  RETURN result;
END;
$$;

-- 7. Criar função para logs de segurança
CREATE TABLE IF NOT EXISTS public.security_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  table_name text NOT NULL,
  record_id text,
  ip_address inet,
  user_agent text,
  success boolean NOT NULL,
  details jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- 8. Habilitar RLS na tabela de logs
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "security_logs_admin_only" ON public.security_logs
  FOR ALL TO authenticated
  USING (false); -- Ninguém pode acessar logs via API normal

-- 9. Função para registrar tentativas de acesso
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_action text,
  p_table_name text,
  p_record_id text DEFAULT NULL,
  p_success boolean DEFAULT true,
  p_details jsonb DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.security_logs (
    user_id,
    action,
    table_name,
    record_id,
    success,
    details
  ) VALUES (
    auth.uid(),
    p_action,
    p_table_name,
    p_record_id,
    p_success,
    p_details
  );
END;
$$;