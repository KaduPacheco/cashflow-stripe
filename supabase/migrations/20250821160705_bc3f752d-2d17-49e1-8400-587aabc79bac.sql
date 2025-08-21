
-- Corrigir dados do usuário VIP superchoqueshorts@gmail.com
UPDATE subscribers 
SET 
  subscribed = true,
  subscription_tier = 'VIP',
  subscription_end = '2030-12-31 23:59:59+00',
  stripe_customer_id = 'cus_vip_superchoque',
  updated_at = now()
WHERE email = 'superchoqueshorts@gmail.com';

-- Garantir que o perfil está ativo
UPDATE profiles 
SET 
  ativo = true,
  updated_at = now()
WHERE email = 'superchoqueshorts@gmail.com';

-- Inserir na tabela subscribers se não existir
INSERT INTO subscribers (email, user_id, subscribed, subscription_tier, subscription_end, stripe_customer_id, updated_at)
SELECT 
  'superchoqueshorts@gmail.com',
  p.id,
  true,
  'VIP',
  '2030-12-31 23:59:59+00',
  'cus_vip_superchoque',
  now()
FROM profiles p 
WHERE p.email = 'superchoqueshorts@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM subscribers s WHERE s.email = 'superchoqueshorts@gmail.com'
  );

-- Verificar os dados finais
SELECT 
  s.email,
  s.subscribed,
  s.subscription_tier,
  s.subscription_end,
  s.stripe_customer_id,
  p.ativo,
  p.nome
FROM subscribers s
JOIN profiles p ON s.user_id = p.id
WHERE s.email = 'superchoqueshorts@gmail.com';
