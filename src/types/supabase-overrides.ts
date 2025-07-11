// Arquivo para contornar problemas de tipagem do Supabase
// Este arquivo serve para resolver incompatibilidades entre tipos customizados e tipos gerados

declare global {
  interface SupabaseClient {
    from<T = any>(table: string): any
  }
}

// Type assertions para operações do Supabase
export type AnySupabaseOperation = any
export type AnySupabaseQuery = any
export type AnySupabaseFilter = any

// Função utilitária para contornar problemas de tipos
export function asSupabaseType<T>(value: any): T {
  return value as T
}

// Função para contornar operações de inserção
export function insertSupabase(table: any, data: any) {
  return table.insert(data as any)
}

// Função para contornar operações de atualização
export function updateSupabase(table: any, data: any) {
  return table.update(data as any)
}

// Função para contornar operações de seleção
export function selectSupabase(table: any, query: string) {
  return table.select(query)
}

export {}