
// Application Constants
export const APP_CONFIG = {
  NAME: 'FinanceFlow',
  VERSION: '1.0.0',
  ENVIRONMENT: import.meta.env.MODE,
} as const

// Route Constants
export const ROUTES = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  TRANSACTIONS: '/transacoes',
  ACCOUNTS: '/contas',
  CATEGORIES: '/categorias',
  REPORTS: '/relatorios',
  REMINDERS: '/lembretes',
  PROFILE: '/perfil',
  PLAN: '/plano',
} as const

// UI Constants
export const UI_CONSTANTS = {
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  PERFORMANCE_DEBOUNCE_DELAY: 300,
  VIRTUALIZED_ITEM_HEIGHT: 80,
  MAX_MOBILE_WIDTH: 768,
  SIDEBAR_WIDTH: 280,
} as const

// Performance Constants
export const PERFORMANCE = {
  RENDER_THRESHOLD_MS: 16, // 60fps threshold
  QUERY_STALE_TIME: 5 * 60 * 1000, // 5 minutes
  QUERY_GC_TIME: 10 * 60 * 1000, // 10 minutes
  MAX_RETRY_ATTEMPTS: 3,
} as const

// Business Logic Constants
export const BUSINESS_RULES = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_TRANSACTION_VALUE: 1000000,
  MAX_DESCRIPTION_LENGTH: 255,
  SUBSCRIPTION_TIERS: ['Free', 'Premium', 'VIP'] as const,
  TRANSACTION_TYPES: ['receita', 'despesa'] as const,
  ACCOUNT_TYPES: ['pagar', 'receber'] as const,
  ACCOUNT_STATUS: ['pendente', 'pago', 'parcialmente_pago', 'vencido'] as const,
  RECURRENCE_TYPES: ['unica', 'mensal', 'trimestral', 'semestral', 'anual'] as const,
} as const

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
  AUTH_REQUIRED: 'Você precisa estar logado para acessar esta página.',
  PERMISSION_DENIED: 'Você não tem permissão para esta ação.',
  VALIDATION_ERROR: 'Por favor, verifique os dados informados.',
  SUBSCRIPTION_REQUIRED: 'Esta funcionalidade requer uma assinatura ativa.',
  GENERIC_ERROR: 'Ocorreu um erro inesperado. Tente novamente.',
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  TRANSACTION_CREATED: 'Transação criada com sucesso!',
  TRANSACTION_UPDATED: 'Transação atualizada com sucesso!',
  TRANSACTION_DELETED: 'Transação excluída com sucesso!',
  CATEGORY_CREATED: 'Categoria criada com sucesso!',
  CATEGORY_UPDATED: 'Categoria atualizada com sucesso!',
  CATEGORY_DELETED: 'Categoria excluída com sucesso!',
  ACCOUNT_CREATED: 'Conta criada com sucesso!',
  ACCOUNT_UPDATED: 'Conta atualizada com sucesso!',
  ACCOUNT_DELETED: 'Conta deletada com sucesso!',
  PAYMENT_PROCESSED: 'Pagamento registrado com sucesso!',
  REMINDER_CREATED: 'Lembrete adicionado com sucesso!',
  REMINDER_UPDATED: 'Lembrete atualizado com sucesso!',
  REMINDER_DELETED: 'Lembrete excluído com sucesso!',
  PASSWORD_CHANGED: 'Senha alterada com sucesso!',
  PROFILE_UPDATED: 'Perfil atualizado com sucesso!',
} as const
