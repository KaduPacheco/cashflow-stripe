-- 1. Criar ENUM para roles de aplicação
CREATE TYPE public.app_role AS ENUM ('founder', 'admin', 'premium', 'user');

-- 2. Criar tabela user_roles
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    notes TEXT,
    UNIQUE (user_id, role)
);

-- 3. Habilitar RLS (apenas service_role pode modificar)
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Política: Ninguém pode acessar via cliente (segurança máxima)
CREATE POLICY "user_roles_no_public_access" 
ON public.user_roles 
FOR ALL 
USING (false);

-- 5. Função SECURITY DEFINER para verificar role (evita recursão RLS)
CREATE OR REPLACE FUNCTION public.has_special_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 6. Inserir o criador do projeto como FOUNDER (acesso Premium vitalício gratuito)
INSERT INTO public.user_roles (user_id, role, notes)
VALUES (
  'a60a591d-6c00-4ff4-a7eb-7b010ca89fa2',
  'founder',
  'Criador do projeto (cadupacheco01@gmail.com) - Acesso Premium vitalício gratuito'
);