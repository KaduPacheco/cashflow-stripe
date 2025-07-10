
# Cash Flow - App de Gestão Financeira

Uma aplicação moderna para controle de fluxo de caixa pessoal ou empresarial com recursos avançados e assinaturas premium.

## 🎯 Visão Geral

- **Objetivo**: Controle completo do fluxo de caixa com visualização clara e segura
- **Usuários**: Individuais ou pequenas empresas
- **Problema resolvido**: Falta de visualização clara e organizada do fluxo financeiro

## 🏗️ Arquitetura

### Stack Tecnológica
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Estado**: React Query + Context API
- **Banco**: Supabase com Row Level Security (RLS)
- **Autenticação**: Supabase Auth
- **Pagamentos**: Stripe com webhooks
- **Validação**: Zod + React Hook Form

## 🚀 Como Iniciar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta no Supabase
- Conta no Stripe (para pagamentos)

### Configuração de Ambiente

1. **Configure as variáveis de ambiente**:
```bash
cp .env.example .env.local
```

2. **Preencha as variáveis obrigatórias**:
```bash
# Supabase (Obrigatório)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima

# Stripe (Opcional - para pagamentos)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_sua-chave

# Sentry (Opcional - para monitoramento)
VITE_SENTRY_DSN=https://sua-dsn.sentry.io
```

### Desenvolvimento

```bash
# 1. Clone o repositório
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# 2. Instale as dependências
npm install

# 3. Execute auditoria de segurança
npm run security:audit

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

### Produção

```bash
# Build da aplicação
npm run build

# Preview da build
npm run preview
```

## 🔐 Segurança e Variáveis de Ambiente

### Variáveis Obrigatórias

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `VITE_SUPABASE_URL` | URL do projeto Supabase | `https://abc.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Chave anônima do Supabase | `eyJhbGciOiJIUzI1...` |

### Variáveis Opcionais

| Variável | Descrição | Uso |
|----------|-----------|-----|
| `VITE_STRIPE_PUBLISHABLE_KEY` | Chave pública do Stripe | Pagamentos |
| `VITE_SENTRY_DSN` | DSN do Sentry | Monitoramento |
| `VITE_APP_VERSION` | Versão da aplicação | Versionamento |

### Boas Práticas de Segurança

- ✅ **Nunca** comite arquivos `.env*` no Git
- ✅ Use apenas chaves **públicas** com prefixo `VITE_`
- ✅ Mantenha secrets **privados** no Supabase Edge Functions
- ✅ Execute `npm audit` regularmente
- ✅ Use HTTPS em produção
- ❌ **Jamais** exponha tokens privados no frontend

## 📜 Scripts de Segurança

```bash
# Auditoria completa de segurança
npm run security:audit

# Atualização segura de dependências
npm run security:update

# Verificação rápida
npm run security:check

# Limpeza de dependências não utilizadas
npm run deps:clean

# Verificação de integridade
npm run deps:verify
```

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React reutilizáveis
├── hooks/              # Hooks personalizados
├── lib/                # Utilitários e configurações
│   ├── env.ts          # Validação de ambiente
│   ├── security.ts     # Configurações de segurança
│   └── sentry.ts       # Monitoramento de erros
├── pages/              # Páginas da aplicação
├── services/           # Serviços de API
└── types/              # Definições TypeScript
```

## 🎨 Design System

### Cores Principais
- **Primária**: #1D4ED8 (azul)
- **Secundária**: Tons de cinza e verde
- **Estados**: Verde (sucesso), Vermelho (erro), Amarelo (aviso)

### Tipografia
- **Fonte**: Inter
- **Tamanhos**: Escala consistente de 12px a 48px

## 🔧 Guia para Contribuidores

### Convenções de Código

#### Nomenclatura
- **Componentes/Páginas**: PascalCase (`TransactionForm.tsx`)
- **Funções/Variáveis**: camelCase (`handleSubmit`, `userData`)
- **Arquivos JS/TS**: camelCase (`userService.ts`, `dateUtils.ts`)
- **Types/Interfaces**: PascalCase (`TransactionData`, `UserProfile`)

### Linting e Formatação

```bash
# Verificar problemas de lint
npm run lint

# Corrigir problemas automaticamente
npm run lint:fix

# Formatar código
npm run format
```

## 🔐 Funcionalidades

### Core Features
1. **Autenticação segura** com Supabase
2. **Dashboard interativo** com gráficos
3. **Transações** (receitas/despesas)
4. **Contas a pagar/receber**
5. **Sistema de categorias**
6. **Lembretes financeiros**
7. **Relatórios em PDF**

### Premium Features
- Transações ilimitadas
- Relatórios avançados
- Sincronização em tempo real
- Suporte prioritário

## 🛡️ Segurança

- Row Level Security (RLS) no Supabase
- Validação de dados no frontend e backend  
- Autenticação JWT
- HTTPS obrigatório
- Sanitização de inputs
- Monitoramento com Sentry
- Auditoria automática de dependências

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório GitHub
2. Configure variáveis de ambiente no dashboard
3. Deploy automático a cada push

### VPS Próprio
Consulte o arquivo `DEPLOYMENT.md` para instruções detalhadas.

## 📝 Scripts Disponíveis

```bash
npm run dev              # Servidor desenvolvimento
npm run build            # Build produção
npm run preview          # Preview da build
npm run lint             # Verificar lint
npm run security:audit   # Auditoria de segurança
npm run security:update  # Atualização segura
```

## 🔧 Variáveis de Ambiente por Funcionalidade

### Básico (Obrigatório)
```bash
VITE_SUPABASE_URL=        # Banco de dados e auth
VITE_SUPABASE_ANON_KEY=   # Chave de acesso
```

### Pagamentos (Opcional)
```bash
VITE_STRIPE_PUBLISHABLE_KEY=  # Processamento de pagamentos
```

### Monitoramento (Opcional)
```bash
VITE_SENTRY_DSN=          # Captura de erros
```

### Desenvolvimento
```bash
VITE_DEBUG=true           # Logs detalhados
VITE_APP_VERSION=1.0.0    # Controle de versão
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Execute auditoria de segurança (`npm run security:audit`)
4. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
5. Push para a branch (`git push origin feature/nova-funcionalidade`)
6. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja `LICENSE` para mais detalhes.

## 🆘 Suporte

- 📧 Email: suporte@cashflow.com
- 💬 Discord: [Link do servidor]
- 📚 Documentação: [Link da documentação]
- 🔒 Segurança: security@cashflow.com

---

Desenvolvido com ❤️ e 🔒 pela equipe Cash Flow
