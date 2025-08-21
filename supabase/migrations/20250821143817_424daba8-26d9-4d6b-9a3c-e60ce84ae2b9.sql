
-- Ativar assinatura VIP para o usuário superchoqueshorts@gmail.com
UPDATE subscribers 
SET 
  subscribed = true,
  subscription_tier = 'VIP',
  subscription_end = '2030-12-31 23:59:59+00',
  updated_at = now()
WHERE email = 'superchoqueshorts@gmail.com';

-- Ativar perfil do usuário
UPDATE profiles 
SET 
  ativo = true,
  updated_at = now()
WHERE email = 'superchoqueshorts@gmail.com';

-- Verificar se as atualizações foram aplicadas corretamente
SELECT 
  s.email,
  s.subscribed,
  s.subscription_tier,
  s.subscription_end,
  p.ativo,
  p.nome
FROM subscribers s
JOIN profiles p ON s.user_id = p.id
WHERE s.email = 'superchoqueshorts@gmail.com';
