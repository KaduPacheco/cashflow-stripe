
-- 1. Fix Database Functions Search Path (CRITICAL)
-- Add SECURITY DEFINER and SET search_path to all database functions

-- Update verify_user_ownership function
CREATE OR REPLACE FUNCTION public.verify_user_ownership(table_name text, record_id text, user_id_field text DEFAULT 'userId'::text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  result boolean := false;
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
        WHERE id = record_id::uuid AND userid = auth.uid()
      ) INTO result;
    WHEN 'contas_pagar_receber' THEN
      SELECT EXISTS(
        SELECT 1 FROM public.contas_pagar_receber 
        WHERE id = record_id::uuid AND user_id = auth.uid()
      ) INTO result;
    WHEN 'clientes_fornecedores' THEN
      SELECT EXISTS(
        SELECT 1 FROM public.clientes_fornecedores 
        WHERE id = record_id::uuid AND user_id = auth.uid()
      ) INTO result;
    ELSE
      result := false;
  END CASE;
  
  RETURN result;
END;
$function$;

-- Update log_security_event function
CREATE OR REPLACE FUNCTION public.log_security_event(p_action text, p_table_name text, p_record_id text DEFAULT NULL::text, p_success boolean DEFAULT true, p_details jsonb DEFAULT NULL::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, nome, phone, whatsapp, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'nome',
    NEW.raw_user_meta_data ->> 'phone',
    NEW.raw_user_meta_data ->> 'whatsapp',
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$function$;

-- Update update_lembretes_whatsapp function
CREATE OR REPLACE FUNCTION public.update_lembretes_whatsapp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Atualizar todos os lembretes do usuário com o novo número de WhatsApp
  UPDATE lembretes 
  SET whatsapp = NEW.whatsapp 
  WHERE userId = NEW.id;
  
  RETURN NEW;
END;
$function$;

-- Update convert_to_brasilia_time function
CREATE OR REPLACE FUNCTION public.convert_to_brasilia_time(input_timestamp timestamp with time zone DEFAULT now())
RETURNS timestamp with time zone
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Converte para o horário de Brasília (UTC-3)
  RETURN input_timestamp AT TIME ZONE 'America/Sao_Paulo';
END;
$function$;

-- Update format_brasilia_datetime function
CREATE OR REPLACE FUNCTION public.format_brasilia_datetime(input_timestamp timestamp with time zone)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Retorna no formato dd/mm/aaaa HH:MM:SS no horário de Brasília
  RETURN to_char(input_timestamp AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI:SS');
END;
$function$;

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 2. Database Schema Security Hardening (HIGH)
-- Make user ID fields NOT NULL where required and fix naming inconsistencies

-- Fix categorias table - userid should not be nullable
ALTER TABLE public.categorias ALTER COLUMN userid SET NOT NULL;

-- Fix transacoes table - userId should not be nullable and change default
ALTER TABLE public.transacoes ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE public.transacoes ALTER COLUMN "userId" DROP DEFAULT;

-- Fix lembretes table - userId should not be nullable
ALTER TABLE public.lembretes ALTER COLUMN "userId" SET NOT NULL;

-- 3. Enable RLS on all public tables (verify all have RLS enabled)
-- Check and enable RLS on any tables that might not have it
ALTER TABLE public.n8n_chat_histories ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for n8n_chat_histories if it doesn't exist
CREATE POLICY "n8n_chat_histories_admin_only" ON public.n8n_chat_histories
FOR ALL USING (false);

-- 4. Add proper foreign key constraints for better referential integrity
-- Add foreign key constraint for categorias.userid
ALTER TABLE public.categorias 
ADD CONSTRAINT categorias_userid_fkey 
FOREIGN KEY (userid) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add foreign key constraint for transacoes.userId
ALTER TABLE public.transacoes 
ADD CONSTRAINT transacoes_userId_fkey 
FOREIGN KEY ("userId") REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add foreign key constraint for lembretes.userId
ALTER TABLE public.lembretes 
ADD CONSTRAINT lembretes_userId_fkey 
FOREIGN KEY ("userId") REFERENCES auth.users(id) ON DELETE CASCADE;

-- 5. Add trigger to update updated_at column where missing
CREATE TRIGGER update_categorias_updated_at 
BEFORE UPDATE ON public.categorias 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contas_pagar_receber_updated_at 
BEFORE UPDATE ON public.contas_pagar_receber 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clientes_fornecedores_updated_at 
BEFORE UPDATE ON public.clientes_fornecedores 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
