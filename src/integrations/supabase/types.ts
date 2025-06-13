export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      categorias: {
        Row: {
          created_at: string
          id: string
          nome: string
          tags: string | null
          updated_at: string
          userid: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          tags?: string | null
          updated_at?: string
          userid: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          tags?: string | null
          updated_at?: string
          userid?: string
        }
        Relationships: []
      }
      lembretes: {
        Row: {
          created_at: string
          data: string | null
          descricao: string | null
          id: number
          userId: string | null
          valor: number | null
        }
        Insert: {
          created_at?: string
          data?: string | null
          descricao?: string | null
          id?: number
          userId?: string | null
          valor?: number | null
        }
        Update: {
          created_at?: string
          data?: string | null
          descricao?: string | null
          id?: number
          userId?: string | null
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lembretes_userid_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          assinaturaId: string | null
          ativo: boolean | null
          avatar_url: string | null
          created_at: string
          customerId: string | null
          email: string | null
          id: string
          nome: string | null
          phone: string | null
          updated_at: string
          username: string | null
          whatsapp: string | null
        }
        Insert: {
          assinaturaId?: string | null
          ativo?: boolean | null
          avatar_url?: string | null
          created_at?: string
          customerId?: string | null
          email?: string | null
          id: string
          nome?: string | null
          phone?: string | null
          updated_at?: string
          username?: string | null
          whatsapp?: string | null
        }
        Update: {
          assinaturaId?: string | null
          ativo?: boolean | null
          avatar_url?: string | null
          created_at?: string
          customerId?: string | null
          email?: string | null
          id?: string
          nome?: string | null
          phone?: string | null
          updated_at?: string
          username?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      transacoes: {
        Row: {
          category_id: string
          created_at: string
          detalhes: string | null
          estabelecimento: string | null
          id: number
          quando: string | null
          tipo: string | null
          userId: string | null
          valor: number | null
        }
        Insert: {
          category_id: string
          created_at?: string
          detalhes?: string | null
          estabelecimento?: string | null
          id?: number
          quando?: string | null
          tipo?: string | null
          userId?: string | null
          valor?: number | null
        }
        Update: {
          category_id?: string
          created_at?: string
          detalhes?: string | null
          estabelecimento?: string | null
          id?: number
          quando?: string | null
          tipo?: string | null
          userId?: string | null
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transacoes_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_userid_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
