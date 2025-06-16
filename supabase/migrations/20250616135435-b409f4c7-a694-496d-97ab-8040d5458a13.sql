
-- Reativar Row Level Security em todas as tabelas principais
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lembretes ENABLE ROW LEVEL SECURITY;

-- Políticas para a tabela profiles
-- Usuários podem ver apenas seu próprio perfil
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Usuários podem inserir apenas seu próprio perfil
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para a tabela categorias
-- Usuários podem ver apenas suas próprias categorias
CREATE POLICY "Users can view own categories" ON public.categorias
    FOR SELECT USING (auth.uid() = userid);

-- Usuários podem criar categorias para si mesmos
CREATE POLICY "Users can create own categories" ON public.categorias
    FOR INSERT WITH CHECK (auth.uid() = userid);

-- Usuários podem atualizar apenas suas próprias categorias
CREATE POLICY "Users can update own categories" ON public.categorias
    FOR UPDATE USING (auth.uid() = userid);

-- Usuários podem deletar apenas suas próprias categorias
CREATE POLICY "Users can delete own categories" ON public.categorias
    FOR DELETE USING (auth.uid() = userid);

-- Políticas para a tabela transacoes
-- Usuários podem ver apenas suas próprias transações
CREATE POLICY "Users can view own transactions" ON public.transacoes
    FOR SELECT USING (auth.uid() = "userId");

-- Usuários podem criar transações para si mesmos
CREATE POLICY "Users can create own transactions" ON public.transacoes
    FOR INSERT WITH CHECK (auth.uid() = "userId");

-- Usuários podem atualizar apenas suas próprias transações
CREATE POLICY "Users can update own transactions" ON public.transacoes
    FOR UPDATE USING (auth.uid() = "userId");

-- Usuários podem deletar apenas suas próprias transações
CREATE POLICY "Users can delete own transactions" ON public.transacoes
    FOR DELETE USING (auth.uid() = "userId");

-- Políticas para a tabela lembretes
-- Usuários podem ver apenas seus próprios lembretes
CREATE POLICY "Users can view own reminders" ON public.lembretes
    FOR SELECT USING (auth.uid() = "userId");

-- Usuários podem criar lembretes para si mesmos
CREATE POLICY "Users can create own reminders" ON public.lembretes
    FOR INSERT WITH CHECK (auth.uid() = "userId");

-- Usuários podem atualizar apenas seus próprios lembretes
CREATE POLICY "Users can update own reminders" ON public.lembretes
    FOR UPDATE USING (auth.uid() = "userId");

-- Usuários podem deletar apenas seus próprios lembretes
CREATE POLICY "Users can delete own reminders" ON public.lembretes
    FOR DELETE USING (auth.uid() = "userId");
