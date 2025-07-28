
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DeactivationResult {
  freeUsersDeactivated: number
  expiredUsersDeactivated: number
  totalDeactivated: number
  errors: string[]
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🔄 Iniciando verificação de usuários inativos...')
    
    // Usar service role key para bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const result: DeactivationResult = {
      freeUsersDeactivated: 0,
      expiredUsersDeactivated: 0,
      totalDeactivated: 0,
      errors: []
    }

    // 1. Identificar usuários gratuitos com mais de 5 dias
    console.log('🔍 Verificando usuários gratuitos com mais de 5 dias...')
    
    const fiveDaysAgo = new Date()
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)
    
    const { data: freeUsers, error: freeUsersError } = await supabaseAdmin
      .from('profiles')
      .select(`
        id,
        email,
        created_at,
        ativo,
        subscribers!left (
          id,
          subscribed
        )
      `)
      .eq('ativo', true)
      .lt('created_at', fiveDaysAgo.toISOString())
      .or('subscribers.id.is.null,subscribers.subscribed.eq.false')

    if (freeUsersError) {
      console.error('❌ Erro ao buscar usuários gratuitos:', freeUsersError)
      result.errors.push(`Erro ao buscar usuários gratuitos: ${freeUsersError.message}`)
    } else if (freeUsers && freeUsers.length > 0) {
      console.log(`📊 Encontrados ${freeUsers.length} usuários gratuitos para desativar`)
      
      // Desativar usuários gratuitos
      const freeUserIds = freeUsers.map(user => user.id)
      
      const { error: deactivateFreeError } = await supabaseAdmin
        .from('profiles')
        .update({ ativo: false })
        .in('id', freeUserIds)

      if (deactivateFreeError) {
        console.error('❌ Erro ao desativar usuários gratuitos:', deactivateFreeError)
        result.errors.push(`Erro ao desativar usuários gratuitos: ${deactivateFreeError.message}`)
      } else {
        result.freeUsersDeactivated = freeUsers.length
        console.log(`✅ ${freeUsers.length} usuários gratuitos desativados com sucesso`)
        
        // Log detalhado dos usuários desativados
        freeUsers.forEach(user => {
          console.log(`📧 Usuário gratuito desativado: ${user.email} (cadastrado em ${user.created_at})`)
        })
      }
    } else {
      console.log('✅ Nenhum usuário gratuito encontrado para desativar')
    }

    // 2. Identificar usuários com plano vencido há mais de 5 dias
    console.log('🔍 Verificando usuários com plano vencido há mais de 5 dias...')
    
    const { data: expiredUsers, error: expiredUsersError } = await supabaseAdmin
      .from('profiles')
      .select(`
        id,
        email,
        created_at,
        ativo,
        subscribers!inner (
          id,
          subscribed,
          subscription_end
        )
      `)
      .eq('ativo', true)
      .eq('subscribers.subscribed', false)
      .lt('subscribers.subscription_end', fiveDaysAgo.toISOString())

    if (expiredUsersError) {
      console.error('❌ Erro ao buscar usuários com plano vencido:', expiredUsersError)
      result.errors.push(`Erro ao buscar usuários com plano vencido: ${expiredUsersError.message}`)
    } else if (expiredUsers && expiredUsers.length > 0) {
      console.log(`📊 Encontrados ${expiredUsers.length} usuários com plano vencido para desativar`)
      
      // Desativar usuários com plano vencido
      const expiredUserIds = expiredUsers.map(user => user.id)
      
      const { error: deactivateExpiredError } = await supabaseAdmin
        .from('profiles')
        .update({ ativo: false })
        .in('id', expiredUserIds)

      if (deactivateExpiredError) {
        console.error('❌ Erro ao desativar usuários com plano vencido:', deactivateExpiredError)
        result.errors.push(`Erro ao desativar usuários com plano vencido: ${deactivateExpiredError.message}`)
      } else {
        result.expiredUsersDeactivated = expiredUsers.length
        console.log(`✅ ${expiredUsers.length} usuários com plano vencido desativados com sucesso`)
        
        // Log detalhado dos usuários desativados
        expiredUsers.forEach(user => {
          const subscriber = Array.isArray(user.subscribers) ? user.subscribers[0] : user.subscribers
          console.log(`📧 Usuário com plano vencido desativado: ${user.email} (venceu em ${subscriber?.subscription_end})`)
        })
      }
    } else {
      console.log('✅ Nenhum usuário com plano vencido encontrado para desativar')
    }

    // 3. Consolidar resultados
    result.totalDeactivated = result.freeUsersDeactivated + result.expiredUsersDeactivated

    console.log(`📊 Resumo da execução:`)
    console.log(`   - Usuários gratuitos desativados: ${result.freeUsersDeactivated}`)
    console.log(`   - Usuários com plano vencido desativados: ${result.expiredUsersDeactivated}`)
    console.log(`   - Total de usuários desativados: ${result.totalDeactivated}`)
    console.log(`   - Erros encontrados: ${result.errors.length}`)

    // Log de segurança para auditoria
    if (result.totalDeactivated > 0) {
      console.log('🔐 Registrando evento de segurança para auditoria...')
      
      const { error: securityLogError } = await supabaseAdmin
        .from('security_logs')
        .insert({
          user_id: null, // Sistema automático
          action: 'AUTO_DEACTIVATE_USERS',
          table_name: 'profiles',
          details: {
            freeUsersDeactivated: result.freeUsersDeactivated,
            expiredUsersDeactivated: result.expiredUsersDeactivated,
            totalDeactivated: result.totalDeactivated,
            executedAt: new Date().toISOString(),
            errors: result.errors
          }
        })

      if (securityLogError) {
        console.error('❌ Erro ao registrar log de segurança:', securityLogError)
        result.errors.push(`Erro ao registrar log de segurança: ${securityLogError.message}`)
      }
    }

    console.log('✅ Verificação de usuários inativos concluída com sucesso')

    return new Response(JSON.stringify(result), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      },
      status: 200
    })

  } catch (error) {
    console.error('💥 Erro crítico na verificação de usuários inativos:', error)
    
    return new Response(JSON.stringify({
      error: 'Erro interno do servidor',
      message: error.message,
      freeUsersDeactivated: 0,
      expiredUsersDeactivated: 0,
      totalDeactivated: 0
    }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      },
      status: 500
    })
  }
})
