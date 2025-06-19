
-- Criar ENUM para tipos de recorrência
CREATE TYPE public.tipo_recorrencia AS ENUM ('unica', 'mensal', 'trimestral', 'semestral', 'anual');

-- Adicionar campos de recorrência à tabela contas_pagar_receber
ALTER TABLE public.contas_pagar_receber 
ADD COLUMN recorrencia tipo_recorrencia DEFAULT 'unica',
ADD COLUMN data_proxima_recorrencia DATE,
ADD COLUMN conta_origem_id UUID REFERENCES public.contas_pagar_receber(id);

-- Criar índice para melhor performance nas consultas de recorrência
CREATE INDEX idx_contas_pagar_receber_recorrencia ON public.contas_pagar_receber(recorrencia);
CREATE INDEX idx_contas_pagar_receber_data_proxima_recorrencia ON public.contas_pagar_receber(data_proxima_recorrencia);
CREATE INDEX idx_contas_pagar_receber_conta_origem ON public.contas_pagar_receber(conta_origem_id);
