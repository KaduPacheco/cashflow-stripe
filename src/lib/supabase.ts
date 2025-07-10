
import { createClient } from '@supabase/supabase-js'
import { env } from './env'
import type { Database } from '@/integrations/supabase/types'

// Cliente Supabase com configurações seguras
export const supabase = createClient<Database>(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
)

// Verificação de conectividade (apenas em desenvolvimento)
if (env.MODE === 'development') {
  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.error('❌ Erro ao conectar com Supabase:', error.message)
    } else {
      console.log('✅ Supabase conectado com sucesso')
    }
  })
}
