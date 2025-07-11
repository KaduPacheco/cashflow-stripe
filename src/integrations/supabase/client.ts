
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Credenciais seguras via variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key environment variables.')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    fetch: (url: any, options: any = {}) => {
      return new Promise<Response>((resolve, reject) => {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => {
          controller.abort()
          reject(new Error('Request timeout'))
        }, 10000) // 10s timeout conforme solicitado
        
        fetch(url, {
          ...options,
          signal: controller.signal,
          mode: 'cors',
          credentials: 'omit'
        })
        .then(response => {
          clearTimeout(timeoutId)
          resolve(response as Response)
        })
        .catch(error => {
          clearTimeout(timeoutId)
          if (error.name === 'AbortError') {
            reject(new Error('Connection timeout'))
          } else {
            reject(error)
          }
        })
      })
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Verificação de conectividade
console.log('✅ Cliente Supabase inicializado:', supabaseUrl)
