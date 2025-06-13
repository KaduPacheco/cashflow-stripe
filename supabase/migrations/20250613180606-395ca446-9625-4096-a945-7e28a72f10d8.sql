
-- Ativar RLS em todas as tabelas
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

-- Usuários podem inserir seu próprio perfil (quando se registram)
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para a tabela categorias (usando 'userid' em minúsculo)
-- Usuários podem ver apenas suas próprias categorias
CREATE POLICY "Users can view own categories" ON public.categorias
    FOR SELECT USING (auth.uid() = userid);

-- Usuários podem inserir suas próprias categorias
CREATE POLICY "Users can insert own categories" ON public.categorias
    FOR INSERT WITH CHECK (auth.uid() = userid);

-- Usuários podem atualizar suas próprias categorias
CREATE POLICY "Users can update own categories" ON public.categorias
    FOR UPDATE USING (auth.uid() = userid);

-- Usuários podem deletar suas próprias categorias
CREATE POLICY "Users can delete own categories" ON public.categorias
    FOR DELETE USING (auth.uid() = userid);

-- Políticas para a tabela transacoes (usando 'userId' com I maiúsculo)
-- Usuários podem ver apenas suas próprias transações
CREATE POLICY "Users can view own transactions" ON public.transacoes
    FOR SELECT USING (auth.uid() = "userId");

-- Usuários podem inserir suas próprias transações
CREATE POLICY "Users can insert own transactions" ON public.transacoes
    FOR INSERT WITH CHECK (auth.uid() = "userId");

-- Usuários podem atualizar suas próprias transações
CREATE POLICY "Users can update own transactions" ON public.transacoes
    FOR UPDATE USING (auth.uid() = "userId");

-- Usuários podem deletar suas próprias transações
CREATE POLICY "Users can delete own transactions" ON public.transacoes
    FOR DELETE USING (auth.uid() = "userId");

-- Políticas para a tabela lembretes (usando 'userId' com I maiúsculo)
-- Usuários podem ver apenas seus próprios lembretes
CREATE POLICY "Users can view own reminders" ON public.lembretes
    FOR SELECT USING (auth.uid() = "userId");

-- Usuários podem inserir seus próprios lembretes
CREATE POLICY "Users can insert own reminders" ON public.lembretes
    FOR INSERT WITH CHECK (auth.uid() = "userId");

-- Usuários podem atualizar seus próprios lembretes
CREATE POLICY "Users can update own reminders" ON public.lembretes
    FOR UPDATE USING (auth.uid() = "userId");

-- Usuários podem deletar seus próprios lembretes
CREATE POLICY "Users can delete own reminders" ON public.lembretes
    FOR DELETE USING (auth.uid() = "userId");
