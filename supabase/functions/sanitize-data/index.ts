
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { XSSProtection, FieldValidator } from '../_shared/xss-protection.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Rate limiting em memória
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const key = `sanitize_${userId}`
  const limit = 100 // 100 requisições por minuto
  const windowMs = 60 * 1000

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

    // Rate limiting
    if (!checkRateLimit(user.id)) {
      return new Response(
        JSON.stringify({ error: 'Muitas tentativas. Tente novamente em alguns minutos.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json()
    const { operation, data, entityType } = body

    // Log da operação para auditoria
    console.log(`[SANITIZE] User ${user.id} - Operation: ${operation} - Entity: ${entityType}`)

    // Verificar se contém XSS antes de processar
    const dataString = JSON.stringify(data)
    if (XSSProtection.containsXSS(dataString)) {
      console.warn(`[XSS_DETECTED] User ${user.id} attempted XSS in ${entityType}`)
      return new Response(
        JSON.stringify({ 
          error: 'Conteúdo suspeito detectado. Por favor, remova caracteres especiais.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let sanitizedData

    // Sanitizar baseado no tipo de entidade
    switch (entityType) {
      case 'transaction':
        sanitizedData = FieldValidator.validateTransactionFields(data)
        break
      case 'category':
        sanitizedData = FieldValidator.validateCategoryFields(data)
        break
      case 'profile':
        sanitizedData = FieldValidator.validateProfileFields(data)
        break
      case 'reminder':
        sanitizedData = FieldValidator.validateReminderFields(data)
        break
      case 'account':
        sanitizedData = FieldValidator.validateAccountFields(data)
        break
      case 'contact':
        sanitizedData = FieldValidator.validateContactFields(data)
        break
      default:
        // Sanitização genérica
        sanitizedData = XSSProtection.sanitizeRequestBody(data)
    }

    // Adicionar userId aos dados sanitizados para garantir segurança
    sanitizedData.userId = user.id

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: sanitizedData,
        message: 'Dados sanitizados com sucesso'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Erro na sanitização:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
