
import { env, features } from '@/lib/env'

// Configurações de segurança centralizadas
export const securityConfig = {
  // Configurações de CORS
  cors: {
    allowedOrigins: env.MODE === 'production' 
      ? ['https://yourdomain.com'] // Substituir pela URL real de produção
      : ['http://localhost:3000', 'http://localhost:5173'],
    allowCredentials: true,
  },
  
  // Configurações de CSP (Content Security Policy)
  csp: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: [
      "'self'",
      env.VITE_SUPABASE_URL,
      ...(features.sentry ? ['https://sentry.io'] : []),
      ...(features.stripe ? ['https://api.stripe.com'] : []),
    ],
  },
  
  // Rate limiting para APIs
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: env.MODE === 'production' ? 100 : 1000, // requests por janela
  },
  
  // Configurações de sessão
  session: {
    httpOnly: true,
    secure: env.MODE === 'production',
    sameSite: 'strict' as const,
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
  },
  
  // Headers de segurança
  securityHeaders: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    ...(env.MODE === 'production' && {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    }),
  },
} as const

// Função para validar ambiente de produção
export function validateProductionSecurity(): void {
  if (env.MODE !== 'production') return
  
  const requiredForProduction = [
    env.VITE_SUPABASE_URL,
    env.VITE_SUPABASE_ANON_KEY,
  ]
  
  const missingVars = requiredForProduction.filter(variable => !variable)
  
  if (missingVars.length > 0) {
    throw new Error('❌ Variáveis críticas ausentes para produção')
  }
  
  console.log('✅ Configurações de produção validadas')
}
