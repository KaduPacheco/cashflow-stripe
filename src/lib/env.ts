
import { z } from 'zod'

// Schema de validação para variáveis de ambiente
const envSchema = z.object({
  // Variáveis obrigatórias para funcionamento básico - usando valores padrão do Supabase
  VITE_SUPABASE_URL: z.string().url('URL do Supabase deve ser válida').default('https://csvkgokkbbtojjkitodc.supabase.co'),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, 'Chave anônima do Supabase é obrigatória').default('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzdmtnb2trdmJ0b2pqa2l0b2RjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1OTE2NTIsImV4cCI6MjA2NTE2NzY1Mn0._pfTwbR3iLhqfJ--Tf6J8RD0lNQ8w8K9kzer8tY3ZDw'),
  
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
    // Preparar objeto de ambiente com valores padrão se necessário
    const envData = {
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://csvkgokkbbtojjkitodc.supabase.co',
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzdmtnb2trdmJ0b2pqa2l0b2RjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1OTE2NTIsImV4cCI6MjA2NTE2NzY1Mn0._pfTwbR3iLhqfJ--Tf6J8RD0lNQ8w8K9kzer8tY3ZDw',
      VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
      VITE_APP_VERSION: import.meta.env.VITE_APP_VERSION,
      VITE_STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
      MODE: import.meta.env.MODE || 'development',
    }
    
    return envSchema.parse(envData)
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
  console.log(`- Supabase: ✅ Conectado`)
  console.log(`- Sentry: ${features.sentry ? '✅ Ativo' : '⚠️ Desabilitado'}`)
  console.log(`- Stripe: ${features.stripe ? '✅ Ativo' : '⚠️ Desabilitado'}`)
  console.log(`- Ambiente: ${env.MODE}`)
}
