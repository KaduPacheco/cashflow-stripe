-- ============================================
-- FASE 1: REMOÇÃO COMPLETA DAS FUNCIONALIDADES ADMIN
-- ============================================

-- 1. REMOVER POLÍTICAS RLS RELACIONADAS A ADMIN
-- ============================================

-- Remover política admin de admin_logs
DROP POLICY IF EXISTS "Admin can access admin_logs" ON public.admin_logs;

-- Remover política admin de categorias
DROP POLICY IF EXISTS "Admin can view all categories" ON public.categorias;

-- Remover política admin de clientes_fornecedores
DROP POLICY IF EXISTS "Admin can view all clients" ON public.clientes_fornecedores;

-- Remover política admin de contas_pagar_receber
DROP POLICY IF EXISTS "Admin can view all accounts" ON public.contas_pagar_receber;

-- Remover política admin de lembretes
DROP POLICY IF EXISTS "Admin can view all reminders" ON public.lembretes;

-- Remover política admin de profiles
DROP POLICY IF EXISTS "Secure admin profiles access" ON public.profiles;

-- Remover política admin de subscribers
DROP POLICY IF EXISTS "Admin can view all subscribers" ON public.subscribers;

-- Remover política admin de transacoes
DROP POLICY IF EXISTS "Admin can view all transactions" ON public.transacoes;


-- 2. REMOVER TRIGGER E FUNÇÃO DE UPDATE ADMIN STATUS
-- ============================================

-- Remover trigger
DROP TRIGGER IF EXISTS update_admin_status_trigger ON public.profiles;

-- Remover função do trigger
DROP FUNCTION IF EXISTS public.update_admin_status();


-- 3. REMOVER FUNÇÕES RELACIONADAS A ADMIN
-- ============================================

-- Remover função de log de ações admin
DROP FUNCTION IF EXISTS public.log_admin_action(text, text, text, jsonb);

-- Remover função de verificação de admin
DROP FUNCTION IF EXISTS public.is_user_admin(uuid);


-- 4. REMOVER TABELA ADMIN_LOGS
-- ============================================

DROP TABLE IF EXISTS public.admin_logs CASCADE;


-- 5. REMOVER COLUNA IS_ADMIN DA TABELA PROFILES
-- ============================================

ALTER TABLE public.profiles DROP COLUMN IF EXISTS is_admin;


-- ============================================
-- REMOÇÃO COMPLETA DAS FUNCIONALIDADES ADMIN
-- Sistema permanece 100% funcional para usuários regulares
-- ============================================