
# Guia de Segurança - Cash Flow

## Auditoria e Manutenção de Dependências

Este projeto inclui ferramentas automatizadas para manter a segurança e atualização das dependências.

### Scripts Disponíveis

#### Auditoria de Segurança
```bash
npm run security:audit
```
- Executa `npm audit` para detectar vulnerabilidades
- Tenta corrigir automaticamente problemas menores
- Gera relatório em `audit-report.txt`
- Identifica dependências não utilizadas

#### Atualização Segura
```bash
npm run security:update
```
- Verifica dependências desatualizadas
- Atualiza automaticamente apenas versões "seguras" (sem breaking changes)
- Requer confirmação manual para atualizações críticas
- Cria backup automático do `package.json`

#### Verificação Rápida
```bash
npm run security:check
```
- Executa `npm audit` e `npm outdated`
- Visão rápida do status de segurança

#### Limpeza de Dependências
```bash
npm run deps:clean
```
- Remove dependências não utilizadas
- Limpa cache do npm

#### Verificação de Integridade
```bash
npm run deps:verify
```
- Lista todas as dependências instaladas
- Verifica integridade da instalação

### Processo Recomendado

#### Verificação Semanal
1. Execute `npm run security:audit`
2. Revise o relatório gerado
3. Execute `npm run security:update` se necessário
4. Teste a aplicação após atualizações

#### Antes de Deploy
1. Execute `npm run security:check`
2. Certifique-se de que não há vulnerabilidades críticas
3. Execute `npm run deps:verify` para confirmar integridade

### Configuração de Segurança

#### Sentry (Monitoramento de Erros)
- Configurado para capturar erros apenas em produção
- Dados sensíveis são sanitizados automaticamente
- Requer `VITE_SENTRY_DSN` nas variáveis de ambiente

#### Rate Limiting
- Implementado para prevenir ataques de força bruta
- Limites diferentes por tipo de operação

#### Sanitização XSS
- Todos os inputs são sanitizados usando DOMPurify
- Proteção automática contra scripts maliciosos

### Dependências Críticas

As seguintes dependências requerem revisão manual antes de atualização:
- `react` / `react-dom`
- `typescript`
- `vite`
- `@supabase/supabase-js`
- `@sentry/react` / `@sentry/node`

### Alertas de Segurança

- **Nunca** ignore vulnerabilidades críticas ou altas
- **Sempre** teste após atualizações de dependências
- **Mantenha** backups do `package.json` antes de atualizações
- **Revise** dependências abandonadas (sem atualização há 6+ meses)

### Contato

Para questões de segurança, entre em contato com a equipe de desenvolvimento.
