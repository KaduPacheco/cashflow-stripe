
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://csvkgokkvbtojjkitodc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzdmtnb2trdmJ0b2pqa2l0b2RjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1OTE2NTIsImV4cCI6MjA2NTE2NzY1Mn0._pfTwbR3iLhqfJ--Tf6J8RD0lNQ8w8K9kzer8tY3ZDw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          nome: string | null
          email: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
          phone: string | null
          whatsapp: string | null
        }
        Insert: {
          id: string
          username?: string | null
          nome?: string | null
          email?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          phone?: string | null
          whatsapp?: string | null
        }
        Update: {
          id?: string
          username?: string | null
          nome?: string | null
          email?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          phone?: string | null
          whatsapp?: string | null
        }
      }
      transacoes: {
        Row: {
          id: number
          created_at: string
          quando: string | null
          estabelecimento: string | null
          valor: number | null
          detalhes: string | null
          tipo: string | null
          categoria: string | null
          userId: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          quando?: string | null
          estabelecimento?: string | null
          valor?: number | null
          detalhes?: string | null
          tipo?: string | null
          categoria?: string | null
          userId?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          quando?: string | null
          estabelecimento?: string | null
          valor?: number | null
          detalhes?: string | null
          tipo?: string | null
          categoria?: string | null
          userId?: string | null
        }
      }
      lembretes: {
        Row: {
          id: number
          created_at: string
          userId: string | null
          descricao: string | null
          data: string | null
          valor: number | null
        }
        Insert: {
          id?: number
          created_at?: string
          userId?: string | null
          descricao?: string | null
          data?: string | null
          valor?: number | null
        }
        Update: {
          id?: number
          created_at?: string
          userId?: string | null
          descricao?: string | null
          data?: string | null
          valor?: number | null
        }
      }
      categorias: {
        Row: {
          id: string
          userid: string
          nome: string
          tags: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          userid: string
          nome: string
          tags?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          userid?: string
          nome?: string
          tags?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
