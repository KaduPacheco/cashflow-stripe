
-- Migração para tornar userId NOT NULL na tabela transacoes
-- ETAPA 1: Verificar e corrigir registros com userId NULL
UPDATE transacoes 
SET "userId" = (
  SELECT auth.uid() 
  FROM auth.users 
  LIMIT 1
)
WHERE "userId" IS NULL;

-- ETAPA 2: Alterar a coluna para NOT NULL
ALTER TABLE transacoes 
ALTER COLUMN "userId" SET NOT NULL;

-- ETAPA 3: Adicionar constraint de foreign key se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'transacoes_userId_fkey' 
    AND table_name = 'transacoes'
  ) THEN
    ALTER TABLE transacoes 
    ADD CONSTRAINT transacoes_userId_fkey 
    FOREIGN KEY ("userId") REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;
