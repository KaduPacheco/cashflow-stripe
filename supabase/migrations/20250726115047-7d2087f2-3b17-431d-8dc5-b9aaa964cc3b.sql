
-- Phase 1: Critical Security Fixes

-- 1. Enable RLS on n8n_chat_histories table and create restrictive policies
ALTER TABLE public.n8n_chat_histories ENABLE ROW LEVEL SECURITY;

-- Create policy to prevent any access to n8n_chat_histories (this appears to be a test/dev table)
CREATE POLICY "Block all access to n8n_chat_histories" 
  ON public.n8n_chat_histories 
  FOR ALL 
  USING (false);

-- 2. Fix database functions by adding SECURITY DEFINER SET search_path = public

-- Fix convert_to_brasilia_time function
CREATE OR REPLACE FUNCTION public.convert_to_brasilia_time(input_timestamp timestamp with time zone DEFAULT now())
 RETURNS timestamp with time zone
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = public
AS $function$
BEGIN
  -- Converte para o horário de Brasília (UTC-3)
  RETURN input_timestamp AT TIME ZONE 'America/Sao_Paulo';
END;
$function$;

-- Fix format_brasilia_datetime function
CREATE OR REPLACE FUNCTION public.format_brasilia_datetime(input_timestamp timestamp with time zone)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = public
AS $function$
BEGIN
  -- Retorna no formato dd/mm/aaaa HH:MM:SS no horário de Brasília
  RETURN to_char(input_timestamp AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI:SS');
END;
$function$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = public
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

-- Fix log_security_event function
CREATE OR REPLACE FUNCTION public.log_security_event(p_action text, p_table_name text, p_record_id text DEFAULT NULL::text, p_success boolean DEFAULT true, p_details jsonb DEFAULT NULL::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = public
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

-- Fix update_lembretes_whatsapp function
CREATE OR REPLACE FUNCTION public.update_lembretes_whatsapp()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = public
AS $function$
BEGIN
  -- Atualizar todos os lembretes do usuário com o novo número de WhatsApp
  UPDATE public.lembretes 
  SET whatsapp = NEW.whatsapp 
  WHERE "userId" = NEW.id;
  
  RETURN NEW;
END;
$function$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now(); 
  RETURN NEW; 
END;
$function$;

-- Fix verify_user_ownership function
CREATE OR REPLACE FUNCTION public.verify_user_ownership(table_name text, record_id text, user_id_field text DEFAULT 'userId'::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = public
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

-- 3. Fix overly permissive RLS policies

-- Fix security_logs table - make it truly admin-only (no access for regular users)
DROP POLICY IF EXISTS "security_logs_admin_only" ON public.security_logs;
CREATE POLICY "security_logs_no_access" 
  ON public.security_logs 
  FOR ALL 
  USING (false);

-- Fix subscribers table UPDATE policy to be more restrictive
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;
CREATE POLICY "update_own_subscription" 
  ON public.subscribers 
  FOR UPDATE 
  USING ((user_id = auth.uid()) OR (email = auth.email()));
