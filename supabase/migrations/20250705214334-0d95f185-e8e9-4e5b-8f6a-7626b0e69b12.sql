
-- Migração para padronização de campos, índices e arquivamento
-- Data: 2025-01-05

-- 1. Padronização do campo userId na tabela categorias (de userid para userId)
ALTER TABLE categorias RENAME COLUMN userid TO "userId";

-- 2. Adicionar campo archived às tabelas principais
ALTER TABLE transacoes ADD COLUMN archived BOOLEAN DEFAULT FALSE;
ALTER TABLE lembretes ADD COLUMN archived BOOLEAN DEFAULT FALSE;
ALTER TABLE categorias ADD COLUMN archived BOOLEAN DEFAULT FALSE;

-- 3. Criar índices compostos para performance
CREATE INDEX IF NOT EXISTS idx_transacoes_user_data ON transacoes("userId", created_at);
CREATE INDEX IF NOT EXISTS idx_transacoes_user_quando ON transacoes("userId", quando);
CREATE INDEX IF NOT EXISTS idx_lembretes_user_data ON lembretes("userId", data);
CREATE INDEX IF NOT EXISTS idx_categorias_user_nome ON categorias("userId", nome);

-- 4. Índices para campos archived (para filtros eficientes)
CREATE INDEX IF NOT EXISTS idx_transacoes_archived ON transacoes(archived) WHERE archived = FALSE;
CREATE INDEX IF NOT EXISTS idx_lembretes_archived ON lembretes(archived) WHERE archived = FALSE;
CREATE INDEX IF NOT EXISTS idx_categorias_archived ON categorias(archived) WHERE archived = FALSE;

-- 5. Preparação para particionamento futuro por ano
-- Criar índice por ano extraído da data de criação
CREATE INDEX IF NOT EXISTS idx_transacoes_year ON transacoes(EXTRACT(YEAR FROM created_at));

-- 6. Atualizar políticas RLS para considerar o novo campo userId na tabela categorias
DROP POLICY IF EXISTS "Users can view own categories" ON categorias;
DROP POLICY IF EXISTS "Users can create own categories" ON categorias;
DROP POLICY IF EXISTS "Users can update own categories" ON categorias;
DROP POLICY IF EXISTS "Users can delete own categories" ON categorias;

CREATE POLICY "Users can view own categories" ON categorias
  FOR SELECT USING (auth.uid() = "userId");

CREATE POLICY "Users can create own categories" ON categorias
  FOR INSERT WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can update own categories" ON categorias
  FOR UPDATE USING (auth.uid() = "userId");

CREATE POLICY "Users can delete own categories" ON categorias
  FOR DELETE USING (auth.uid() = "userId");

-- 7. Criar função para arquivamento automático (preparação para cronjob)
CREATE OR REPLACE FUNCTION archive_old_transactions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  -- Arquiva transações com mais de 12 meses
  UPDATE transacoes 
  SET archived = TRUE 
  WHERE created_at < NOW() - INTERVAL '12 months' 
    AND archived = FALSE;
  
  GET DIAGNOSTICS archived_count = ROW_COUNT;
  
  -- Log da operação
  INSERT INTO public.system_logs (operation, details, created_at)
  VALUES ('auto_archive', 
          jsonb_build_object('archived_transactions', archived_count),
          NOW());
  
  RETURN archived_count;
END;
$$;

-- 8. Criar tabela de logs do sistema (se não existir)
CREATE TABLE IF NOT EXISTS system_logs (
  id SERIAL PRIMARY KEY,
  operation VARCHAR(50) NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Função para exportação de dados (backup programático)
CREATE OR REPLACE FUNCTION export_user_data(user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'user_id', user_id,
    'exported_at', NOW(),
    'transacoes', (
      SELECT jsonb_agg(row_to_json(t.*))
      FROM transacoes t
      WHERE t."userId" = user_id
    ),
    'lembretes', (
      SELECT jsonb_agg(row_to_json(l.*))
      FROM lembretes l
      WHERE l."userId" = user_id
    ),
    'categorias', (
      SELECT jsonb_agg(row_to_json(c.*))
      FROM categorias c
      WHERE c."userId" = user_id
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- 10. Atualizar triggers para manter updated_at nas tabelas com novos campos
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Garantir que os triggers existem
DROP TRIGGER IF EXISTS update_categorias_updated_at ON categorias;
CREATE TRIGGER update_categorias_updated_at
  BEFORE UPDATE ON categorias
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
