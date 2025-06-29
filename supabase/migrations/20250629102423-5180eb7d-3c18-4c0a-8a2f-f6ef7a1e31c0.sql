
-- Adicionar campo whatsapp na tabela lembretes
ALTER TABLE lembretes ADD COLUMN whatsapp text;

-- Criar função para atualizar lembretes quando o whatsapp do usuário mudar
CREATE OR REPLACE FUNCTION update_lembretes_whatsapp()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar todos os lembretes do usuário com o novo número de WhatsApp
  UPDATE lembretes 
  SET whatsapp = NEW.whatsapp 
  WHERE userId = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para atualizar lembretes quando o perfil do usuário for alterado
CREATE TRIGGER update_lembretes_whatsapp_trigger
  AFTER UPDATE OF whatsapp ON profiles
  FOR EACH ROW
  WHEN (OLD.whatsapp IS DISTINCT FROM NEW.whatsapp)
  EXECUTE FUNCTION update_lembretes_whatsapp();
