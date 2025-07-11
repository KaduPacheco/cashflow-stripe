
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
