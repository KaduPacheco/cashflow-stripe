
-- Configurar cron job para verificação diária de usuários inativos
-- Executa todos os dias às 02:00 AM
SELECT cron.schedule(
  'expire-inactive-users-daily',
  '0 2 * * *', -- Todos os dias às 2h da manhã
  $$
  SELECT
    net.http_post(
        url:='https://csvkgokkvbtojjkitodc.supabase.co/functions/v1/expire-inactive-users',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzdmtnb2trdmJ0b2pqa2l0b2RjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTU5MTY1MiwiZXhwIjoyMDY1MTY3NjUyfQ.VqBNm3LbJ3_k-XFr0WL8KY1vQFQ_a6oYkCHKU3EeQUo"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);
