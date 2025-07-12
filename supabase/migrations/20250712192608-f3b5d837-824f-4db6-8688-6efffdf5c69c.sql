
-- Adicionar campo para controlar se a notificação WhatsApp já foi enviada
ALTER TABLE lembretes ADD COLUMN whatsapp_notification_sent boolean DEFAULT false;

-- Habilitar extensões necessárias para cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
