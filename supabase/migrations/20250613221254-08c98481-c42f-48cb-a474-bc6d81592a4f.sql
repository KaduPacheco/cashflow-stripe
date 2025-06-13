
-- Atualizar a função para incluir o campo whatsapp dos metadados
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
