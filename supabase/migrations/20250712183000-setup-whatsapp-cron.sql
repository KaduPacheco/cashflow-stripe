
-- Configurar cron job para executar a função de notificações WhatsApp a cada 5 minutos
SELECT cron.schedule(
  'whatsapp-notifications-job',
  '*/5 * * * *', -- A cada 5 minutos
  $$
  SELECT
    net.http_post(
      url := 'https://csvkgokkvbtojjkitodc.supabase.co/functions/v1/whatsapp-notifications',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzdmtnb2trdmJ0b2pqa2l0b2RjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1OTE2NTIsImV4cCI6MjA2NTE2NzY1Mn0._pfTwbR3iLhqfJ--Tf6J8RD0lNQ8w8K9kzer8tY3ZDw"}'::jsonb,
      body := '{"trigger": "cron"}'::jsonb
    ) as request_id;
  $$
);
