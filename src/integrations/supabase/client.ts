
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Credenciais diretas do projeto Supabase
const supabaseUrl = 'https://csvkgokkbbtojjkitodc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzdmtnb2trdmJ0b2pqa2l0b2RjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1OTE2NTIsImV4cCI6MjA2NTE2NzY1Mn0._pfTwbR3iLhqfJ--Tf6J8RD0lNQ8w8K9kzer8tY3ZDw'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Verificação de conectividade
console.log('✅ Cliente Supabase inicializado:', supabaseUrl)
