
-- Primeiro, vamos garantir que a função existe e está correta
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome, phone, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'nome',
    NEW.raw_user_meta_data ->> 'phone',
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover o trigger existente se houver
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recriar o trigger para executar a função quando um novo usuário é criado
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Atualizar perfis existentes que podem estar sem nome/telefone
-- (apenas para usuários que já existem mas não têm dados no perfil)
UPDATE public.profiles 
SET 
  nome = COALESCE(nome, (
    SELECT raw_user_meta_data ->> 'nome' 
    FROM auth.users 
    WHERE auth.users.id = profiles.id
  )),
  phone = COALESCE(phone, (
    SELECT raw_user_meta_data ->> 'phone' 
    FROM auth.users 
    WHERE auth.users.id = profiles.id
  )),
  updated_at = NOW()
WHERE (nome IS NULL OR nome = '') 
   OR (phone IS NULL OR phone = '');
