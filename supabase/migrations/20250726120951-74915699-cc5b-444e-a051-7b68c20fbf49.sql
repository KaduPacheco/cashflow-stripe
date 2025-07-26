
-- Implementação do Painel de Administração - Fase 1: Segurança Backend

-- 1. Adicionar coluna is_admin na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- 2. Definir o usuário admin específico
UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'adm.forteia@gmail.com';

-- 3. Criar função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = user_id 
    AND email = 'adm.forteia@gmail.com' 
    AND is_admin = true
  );
END;
$$;

-- 4. Criar tabela para logs administrativos
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  target_table text,
  target_id text,
  details jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- 5. Habilitar RLS na tabela admin_logs
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- 6. Criar política para admin_logs (apenas admin pode acessar)
CREATE POLICY "Admin can access admin_logs" 
  ON public.admin_logs 
  FOR ALL 
  USING (public.is_user_admin(auth.uid()));

-- 7. Criar função para log de ações administrativas
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action text,
  p_target_table text DEFAULT NULL,
  p_target_id text DEFAULT NULL,
  p_details jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Só permite log se o usuário for admin
  IF public.is_user_admin(auth.uid()) THEN
    INSERT INTO public.admin_logs (
      admin_user_id,
      action,
      target_table,
      target_id,
      details
    ) VALUES (
      auth.uid(),
      p_action,
      p_target_table,
      p_target_id,
      p_details
    );
  END IF;
END;
$$;

-- 8. Criar políticas administrativas para visualização de todos os dados
-- (apenas para demonstração - ajustar conforme necessário)

-- Política para admin visualizar todos os profiles
CREATE POLICY "Admin can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (public.is_user_admin(auth.uid()));

-- Política para admin visualizar todas as transações
CREATE POLICY "Admin can view all transactions" 
  ON public.transacoes 
  FOR SELECT 
  USING (public.is_user_admin(auth.uid()));

-- Política para admin visualizar todas as categorias
CREATE POLICY "Admin can view all categories" 
  ON public.categorias 
  FOR SELECT 
  USING (public.is_user_admin(auth.uid()));

-- Política para admin visualizar todos os lembretes
CREATE POLICY "Admin can view all reminders" 
  ON public.lembretes 
  FOR SELECT 
  USING (public.is_user_admin(auth.uid()));

-- Política para admin visualizar todas as contas
CREATE POLICY "Admin can view all accounts" 
  ON public.contas_pagar_receber 
  FOR SELECT 
  USING (public.is_user_admin(auth.uid()));

-- Política para admin visualizar clientes/fornecedores
CREATE POLICY "Admin can view all clients" 
  ON public.clientes_fornecedores 
  FOR SELECT 
  USING (public.is_user_admin(auth.uid()));

-- Política para admin visualizar subscribers
CREATE POLICY "Admin can view all subscribers" 
  ON public.subscribers 
  FOR SELECT 
  USING (public.is_user_admin(auth.uid()));

-- 9. Criar trigger para atualizar is_admin baseado no email
CREATE OR REPLACE FUNCTION public.update_admin_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Automaticamente define is_admin para o email específico
  IF NEW.email = 'adm.forteia@gmail.com' THEN
    NEW.is_admin = true;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para profiles
DROP TRIGGER IF EXISTS update_admin_status_trigger ON public.profiles;
CREATE TRIGGER update_admin_status_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_admin_status();
