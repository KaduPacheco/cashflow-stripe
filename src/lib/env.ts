
import { z } from 'zod'

// Schema de validação para variáveis de ambiente
const envSchema = z.object({
  // Variáveis obrigatórias para funcionamento básico
  VITE_SUPABASE_URL: z.string().url('URL do Supabase deve ser válida'),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, 'Chave anônima do Supabase é obrigatória'),
  
  // Variáveis opcionais com fallbacks seguros
  VITE_SENTRY_DSN: z.string().url().optional(),
  VITE_APP_VERSION: z.string().optional().default('1.0.0'),
  VITE_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  
  // Variáveis de desenvolvimento
  MODE: z.enum(['development', 'production', 'test']).optional().default('development'),
})

// Tipo TypeScript baseado no schema
export type EnvConfig = z.infer<typeof envSchema>

// Função para validar e obter configurações do ambiente
export function validateEnv(): EnvConfig {
  try {
    return envSchema.parse(import.meta.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map(issue => 
        `${issue.path.join('.')}: ${issue.message}`
      ).join('\n')
      
      console.error('❌ Erro de configuração do ambiente:')
      console.error(missingVars)
      console.error('\n📋 Verifique se todas as variáveis necessárias estão configuradas.')
      
      throw new Error(`Variáveis de ambiente inválidas ou ausentes:\n${missingVars}`)
    }
    throw error
  }
}

// Configuração validada e tipada
export const env = validateEnv()

// Utilitários para verificação de funcionalidades
export const features = {
  sentry: !!env.VITE_SENTRY_DSN,
  stripe: !!env.VITE_STRIPE_PUBLISHABLE_KEY,
  isProduction: env.MODE === 'production',
  isDevelopment: env.MODE === 'development',
} as const

// Log de status das configurações (apenas em desenvolvimento)
if (env.MODE === 'development') {
  console.log('🔧 Status das configurações:')
  console.log(`- Sentry: ${features.sentry ? '✅ Ativo' : '⚠️ Desabilitado'}`)
  console.log(`- Stripe: ${features.stripe ? '✅ Ativo' : '⚠️ Desabilitado'}`)
  console.log(`- Ambiente: ${env.MODE}`)
}
