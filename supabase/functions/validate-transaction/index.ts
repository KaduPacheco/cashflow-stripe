
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { validateTransaction } from '../_shared/validation.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Rate limiting em memória
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(userId: string, operation: string): boolean {
  const now = Date.now()
  const key = `${operation}_${userId}`
  const limit = operation === 'transaction_create' ? 50 : 10 // 50 transações ou 10 outras ops por minuto
  const windowMs = 60 * 1000 // 1 minuto
  
  const current = rateLimitMap.get(key)
  
  if (!current || now > current.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (current.count >= limit) {
    return false
  }
  
  current.count++
  return true
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verificar autenticação
    const authorization = req.headers.get('Authorization')
    if (!authorization) {
      return new Response(
        JSON.stringify({ error: 'Token de autorização necessário' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    })

    // Verificar usuário
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authorization.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Token inválido' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json()
    const { operation, data: transactionData } = body

    // Rate limiting por operação e usuário
    if (!checkRateLimit(user.id, operation)) {
      return new Response(
        JSON.stringify({ error: 'Muitas tentativas. Tente novamente em alguns minutos.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validar dados da transação
    try {
      const validatedData = validateTransaction(transactionData)
      
      // Sanitizar campos de texto
      const sanitizedData = {
        ...validatedData,
        estabelecimento: validatedData.estabelecimento?.replace(/[<>\"'&]/g, '').trim().slice(0, 200),
        detalhes: validatedData.detalhes?.replace(/[<>\"'&]/g, '').trim().slice(0, 500),
        userId: user.id
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          data: sanitizedData,
          message: 'Transação validada com sucesso' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } catch (validationError: any) {
      return new Response(
        JSON.stringify({ 
          error: 'Dados inválidos', 
          details: validationError.message 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error: any) {
    console.error('Erro na validação:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
