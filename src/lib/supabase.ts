
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://beiximbpoiiuqnkjrnou.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlaXhpbWJwb2lpdXFua2pybm91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4ODk1NjMsImV4cCI6MjA2MDQ2NTU2M30.cAwb1NIXPkTpfV0bVrNL4vn9Kg2FznnFX8Q74K_kLl0'

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
