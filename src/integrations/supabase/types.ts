export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
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
      clientes_fornecedores: {
        Row: {
          ativo: boolean
          created_at: string
          documento: string | null
          email: string | null
          endereco: string | null
          id: string
          nome: string
          observacoes: string | null
          telefone: string | null
          tipo: Database["public"]["Enums"]["tipo_contato"]
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          documento?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          telefone?: string | null
          tipo?: Database["public"]["Enums"]["tipo_contato"]
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          documento?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          telefone?: string | null
          tipo?: Database["public"]["Enums"]["tipo_contato"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contas_pagar_receber: {
        Row: {
          category_id: string | null
          cliente_fornecedor_id: string | null
          conta_origem_id: string | null
          created_at: string
          data_pagamento: string | null
          data_proxima_recorrencia: string | null
          data_vencimento: string
          descricao: string
          id: string
          numero_documento: string | null
          observacoes: string | null
          recorrencia: Database["public"]["Enums"]["tipo_recorrencia"] | null
          status: Database["public"]["Enums"]["status_conta"]
          tipo: Database["public"]["Enums"]["tipo_conta"]
          updated_at: string
          user_id: string
          valor: number
          valor_pago: number | null
        }
        Insert: {
          category_id?: string | null
          cliente_fornecedor_id?: string | null
          conta_origem_id?: string | null
          created_at?: string
          data_pagamento?: string | null
          data_proxima_recorrencia?: string | null
          data_vencimento: string
          descricao: string
          id?: string
          numero_documento?: string | null
          observacoes?: string | null
          recorrencia?: Database["public"]["Enums"]["tipo_recorrencia"] | null
          status?: Database["public"]["Enums"]["status_conta"]
          tipo: Database["public"]["Enums"]["tipo_conta"]
          updated_at?: string
          user_id: string
          valor: number
          valor_pago?: number | null
        }
        Update: {
          category_id?: string | null
          cliente_fornecedor_id?: string | null
          conta_origem_id?: string | null
          created_at?: string
          data_pagamento?: string | null
          data_proxima_recorrencia?: string | null
          data_vencimento?: string
          descricao?: string
          id?: string
          numero_documento?: string | null
          observacoes?: string | null
          recorrencia?: Database["public"]["Enums"]["tipo_recorrencia"] | null
          status?: Database["public"]["Enums"]["status_conta"]
          tipo?: Database["public"]["Enums"]["tipo_conta"]
          updated_at?: string
          user_id?: string
          valor?: number
          valor_pago?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contas_pagar_receber_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_pagar_receber_cliente_fornecedor_id_fkey"
            columns: ["cliente_fornecedor_id"]
            isOneToOne: false
            referencedRelation: "clientes_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_pagar_receber_conta_origem_id_fkey"
            columns: ["conta_origem_id"]
            isOneToOne: false
            referencedRelation: "contas_pagar_receber"
            referencedColumns: ["id"]
          },
        ]
      }
      lembretes: {
        Row: {
          created_at: string
          data: string | null
          data_envio_whatsapp: string | null
          descricao: string | null
          horario_envio_whatsapp: string | null
          id: number
          notificar_whatsapp: boolean | null
          userId: string | null
          valor: number | null
          whatsapp: string | null
          whatsapp_notification_sent: boolean | null
        }
        Insert: {
          created_at?: string
          data?: string | null
          data_envio_whatsapp?: string | null
          descricao?: string | null
          horario_envio_whatsapp?: string | null
          id?: number
          notificar_whatsapp?: boolean | null
          userId?: string | null
          valor?: number | null
          whatsapp?: string | null
          whatsapp_notification_sent?: boolean | null
        }
        Update: {
          created_at?: string
          data?: string | null
          data_envio_whatsapp?: string | null
          descricao?: string | null
          horario_envio_whatsapp?: string | null
          id?: number
          notificar_whatsapp?: boolean | null
          userId?: string | null
          valor?: number | null
          whatsapp?: string | null
          whatsapp_notification_sent?: boolean | null
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
      n8n_chat_histories: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
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
      security_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          record_id: string | null
          success: boolean
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          record_id?: string | null
          success: boolean
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          record_id?: string | null
          success?: boolean
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
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
      convert_to_brasilia_time: {
        Args: { input_timestamp?: string }
        Returns: string
      }
      format_brasilia_datetime: {
        Args: { input_timestamp: string }
        Returns: string
      }
      log_security_event: {
        Args: {
          p_action: string
          p_table_name: string
          p_record_id?: string
          p_success?: boolean
          p_details?: Json
        }
        Returns: undefined
      }
      verify_user_ownership: {
        Args: { table_name: string; record_id: string; user_id_field?: string }
        Returns: boolean
      }
    }
    Enums: {
      status_conta:
        | "pendente"
        | "pago"
        | "parcialmente_pago"
        | "vencido"
        | "cancelado"
      tipo_conta: "pagar" | "receber"
      tipo_contato: "cliente" | "fornecedor" | "ambos"
      tipo_recorrencia:
        | "unica"
        | "mensal"
        | "trimestral"
        | "semestral"
        | "anual"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      status_conta: [
        "pendente",
        "pago",
        "parcialmente_pago",
        "vencido",
        "cancelado",
      ],
      tipo_conta: ["pagar", "receber"],
      tipo_contato: ["cliente", "fornecedor", "ambos"],
      tipo_recorrencia: ["unica", "mensal", "trimestral", "semestral", "anual"],
    },
  },
} as const
