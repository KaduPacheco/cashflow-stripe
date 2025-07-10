import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verificar autenticação
    const authorization = req.headers.get('Authorization')
    if (!authorization) {
      return new Response(
        JSON.stringify({ 
          error: 'Você não tem permissão para esta operação',
          code: 'UNAUTHORIZED'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verificar usuário autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authorization.replace('Bearer ', '')
    )

    if (authError || !user) {
      console.log('Authorization failed:', authError)
      
      // Log tentativa de acesso negado
      await supabase.rpc('log_security_event', {
        p_action: 'unauthorized_access',
        p_table_name: 'auth_check',
        p_success: false,
        p_details: { ip: req.headers.get('cf-connecting-ip') }
      }).catch(() => {}) // Ignore log errors
      
      return new Response(
        JSON.stringify({ 
          error: 'Você não tem permissão para esta operação',
          code: 'INVALID_TOKEN'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json()
    const { action, tableName, recordId, data } = body

    // Rate limiting simples
    const userActions = new Map()
    const userId = user.id
    const now = Date.now()
    const windowMs = 60000 // 1 minuto
    const maxActions = 50

    const userActionCount = userActions.get(userId) || { count: 0, resetTime: now + windowMs }
    
    if (now > userActionCount.resetTime) {
      userActionCount.count = 1
      userActionCount.resetTime = now + windowMs
    } else if (userActionCount.count >= maxActions) {
      return new Response(
        JSON.stringify({ 
          error: 'Muitas tentativas. Tente novamente em alguns minutos.',
          code: 'RATE_LIMITED'
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      userActionCount.count++
    }
    
    userActions.set(userId, userActionCount)

    // Verificar ownership se for operação crítica
    if (['update', 'delete'].includes(action) && recordId) {
      const { data: hasOwnership, error: ownershipError } = await supabase
        .rpc('verify_user_ownership', {
          table_name: tableName,
          record_id: recordId
        })

      if (ownershipError || !hasOwnership) {
        // Log tentativa de acesso negado
        await supabase.rpc('log_security_event', {
          p_action: `unauthorized_${action}`,
          p_table_name: tableName,
          p_record_id: recordId,
          p_success: false,
          p_details: { 
            user_id: userId,
            ip: req.headers.get('cf-connecting-ip'),
            user_agent: req.headers.get('user-agent')
          }
        }).catch(() => {})

        return new Response(
          JSON.stringify({ 
            error: 'Você não tem permissão para modificar este registro',
            code: 'FORBIDDEN'
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Log operação autorizada
    await supabase.rpc('log_security_event', {
      p_action: action,
      p_table_name: tableName,
      p_record_id: recordId,
      p_success: true,
      p_details: { 
        user_id: userId,
        data_size: JSON.stringify(data || {}).length
      }
    }).catch(() => {})

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Operação autorizada',
        userId: userId
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Auth verification error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})