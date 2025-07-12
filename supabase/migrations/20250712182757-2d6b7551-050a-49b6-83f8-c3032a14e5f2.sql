
-- Adicionar campos para configurações de WhatsApp nos lembretes
ALTER TABLE lembretes ADD COLUMN notificar_whatsapp boolean DEFAULT false;
ALTER TABLE lembretes ADD COLUMN data_envio_whatsapp timestamp with time zone;
ALTER TABLE lembretes ADD COLUMN horario_envio_whatsapp time;
