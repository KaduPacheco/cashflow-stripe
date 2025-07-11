
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

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React reutilizáveis
│   ├── ui/             # Componentes base (shadcn/ui)
│   ├── auth/           # Componentes de autenticação
│   ├── dashboard/      # Componentes do dashboard
│   ├── transacoes/     # Componentes de transações
│   ├── contas/         # Contas a pagar/receber
│   └── lembretes/      # Sistema de lembretes
├── hooks/              # Hooks personalizados
├── lib/                # Utilitários e configurações
├── pages/              # Páginas da aplicação
├── services/           # Serviços de API
├── types/              # Definições TypeScript
└── utils/              # Funções utilitárias
```

## 🚀 Como Iniciar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta no Supabase
- Conta no Stripe (para pagamentos)

### Desenvolvimento

```bash
# 1. Clone o repositório
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais

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

## 🎨 Design System

### Cores Principais
- **Primária**: #1D4ED8 (azul)
- **Secundária**: Tons de cinza e verde
- **Estados**: Verde (sucesso), Vermelho (erro), Amarelo (aviso)

### Tipografia
- **Fonte**: Inter
- **Tamanhos**: Escala consistente de 12px a 48px

### Componentes
- Baseados em shadcn/ui com customizações
- Dark mode nativo
- Responsividade mobile-first

## 🔧 Guia para Contribuidores

### Convenções de Código

#### Nomenclatura
- **Componentes/Páginas**: PascalCase (`TransactionForm.tsx`)
- **Funções/Variáveis**: camelCase (`handleSubmit`, `userData`)
- **Arquivos JS/TS**: camelCase (`userService.ts`, `dateUtils.ts`)
- **Types/Interfaces**: PascalCase (`TransactionData`, `UserProfile`)

#### Estrutura de Componentes
```typescript
import React from 'react'

interface ComponentProps {
  // Props tipadas
}

/**
 * Documentação JSDoc para componentes reutilizáveis
 * @param prop1 - Descrição do prop
 * @returns Descrição do retorno
 */
export const Component: React.FC<ComponentProps> = ({ prop1 }) => {
  // Lógica do componente
  
  return (
    // JSX
  )
}
```

#### Hooks Personalizados
```typescript
interface UseHookReturn {
  value: string
  loading: boolean
  error: string | null
}

export const useCustomHook = (): UseHookReturn => {
  // Lógica do hook
  
  return { value, loading, error }
}
```

### Padrões de Desenvolvimento

#### Estado e Dados
- **Dados assíncronos**: React Query
- **Estado global leve**: Context API
- **Formulários**: React Hook Form + Zod
- **Validações**: Sempre no cliente e servidor

#### Tratamento de Erros
- ErrorBoundary para erros de renderização
- Try/catch para operações assíncronas
- Mensagens de erro consistentes com toast

#### Performance
- Lazy loading para rotas
- Memoização com `useMemo`/`useCallback`
- Componentes virtualizados para listas grandes

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

## 📊 Monitoramento

- Logs estruturados
- Error tracking
- Performance monitoring
- Analytics de uso

## 🚀 Deploy

### Automático (Recomendado)
- Push para `main` branch
- CI/CD automático via GitHub Actions
- Deploy automático no Vercel/Netlify

### Manual
```bash
npm run build
# Deploy da pasta dist/
```

## 📝 Scripts Disponíveis

```bash
npm run dev          # Servidor desenvolvimento
npm run build        # Build produção
npm run preview      # Preview da build
npm run lint         # Verificar lint
npm run lint:fix     # Corrigir lint
npm run test         # Executar testes
npm run type-check   # Verificar tipos TS
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja `LICENSE` para mais detalhes.

## 🆘 Suporte

- 📧 Email: suporte@cashflow.com
- 💬 Discord: [Link do servidor]
- 📚 Documentação: [Link da documentação]

---

Desenvolvido com ❤️ pela equipe Cash Flow
