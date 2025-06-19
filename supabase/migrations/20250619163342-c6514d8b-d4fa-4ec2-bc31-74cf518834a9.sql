
-- Criar ENUM para tipo de conta
CREATE TYPE public.tipo_conta AS ENUM ('pagar', 'receber');

-- Criar ENUM para status da conta
CREATE TYPE public.status_conta AS ENUM ('pendente', 'pago', 'parcialmente_pago', 'vencido', 'cancelado');

-- Criar ENUM para tipo de cliente/fornecedor
CREATE TYPE public.tipo_contato AS ENUM ('cliente', 'fornecedor', 'ambos');

-- Criar tabela de clientes e fornecedores
CREATE TABLE public.clientes_fornecedores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  tipo tipo_contato NOT NULL DEFAULT 'cliente',
  documento VARCHAR(20),
  email VARCHAR(255),
  telefone VARCHAR(20),
  endereco TEXT,
  observacoes TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de contas a pagar e receber
CREATE TABLE public.contas_pagar_receber (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tipo tipo_conta NOT NULL,
  descricao TEXT NOT NULL,
  valor NUMERIC(15,2) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  valor_pago NUMERIC(15,2) DEFAULT 0,
  status status_conta NOT NULL DEFAULT 'pendente',
  category_id UUID REFERENCES public.categorias(id),
  cliente_fornecedor_id UUID REFERENCES public.clientes_fornecedores(id),
  observacoes TEXT,
  numero_documento VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.clientes_fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contas_pagar_receber ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para clientes_fornecedores
CREATE POLICY "Users can view their own contacts" 
  ON public.clientes_fornecedores 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contacts" 
  ON public.clientes_fornecedores 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts" 
  ON public.clientes_fornecedores 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts" 
  ON public.clientes_fornecedores 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Criar políticas RLS para contas_pagar_receber
CREATE POLICY "Users can view their own accounts" 
  ON public.contas_pagar_receber 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own accounts" 
  ON public.contas_pagar_receber 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts" 
  ON public.contas_pagar_receber 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own accounts" 
  ON public.contas_pagar_receber 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Criar trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_clientes_fornecedores_updated_at
  BEFORE UPDATE ON public.clientes_fornecedores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contas_pagar_receber_updated_at
  BEFORE UPDATE ON public.contas_pagar_receber
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Criar índices para melhor performance
CREATE INDEX idx_clientes_fornecedores_user_id ON public.clientes_fornecedores(user_id);
CREATE INDEX idx_clientes_fornecedores_tipo ON public.clientes_fornecedores(tipo);
CREATE INDEX idx_contas_pagar_receber_user_id ON public.contas_pagar_receber(user_id);
CREATE INDEX idx_contas_pagar_receber_tipo ON public.contas_pagar_receber(tipo);
CREATE INDEX idx_contas_pagar_receber_status ON public.contas_pagar_receber(status);
CREATE INDEX idx_contas_pagar_receber_data_vencimento ON public.contas_pagar_receber(data_vencimento);
