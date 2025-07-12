
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🔍 Buscando lembretes para envio via WhatsApp...')

    // Buscar lembretes que precisam ser enviados
    const agora = new Date()
    const hoje = agora.toISOString().split('T')[0] // YYYY-MM-DD
    const horaAtual = agora.toTimeString().split(' ')[0].substring(0, 5) // HH:MM

    const { data: lembretes, error } = await supabaseClient
      .from('lembretes')
      .select(`
        id,
        descricao,
        data,
        valor,
        whatsapp,
        data_envio_whatsapp,
        horario_envio_whatsapp,
        userId,
        profiles!lembretes_userId_fkey(nome, whatsapp)
      `)
      .eq('notificar_whatsapp', true)
      .eq('whatsapp_notification_sent', false)
      .eq('data_envio_whatsapp', hoje)
      .lte('horario_envio_whatsapp', horaAtual)

    if (error) {
      console.error('❌ Erro ao buscar lembretes:', error)
      throw error
    }

    console.log(`📋 Encontrados ${lembretes?.length || 0} lembretes para envio`)

    if (!lembretes || lembretes.length === 0) {
      return new Response(
        JSON.stringify({ message: 'Nenhum lembrete para envio encontrado' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    const resultados = []

    for (const lembrete of lembretes) {
      try {
        // Pegar o WhatsApp do usuário (do perfil ou do lembrete)
        const whatsappNumber = lembrete.profiles?.whatsapp || lembrete.whatsapp
        
        if (!whatsappNumber) {
          console.log(`⚠️ Lembrete ${lembrete.id}: Sem número de WhatsApp`)
          resultados.push({
            lembreteId: lembrete.id,
            success: false,
            error: 'Número de WhatsApp não encontrado'
          })
          continue
        }

        // Formatar a mensagem
        const dataFormatada = lembrete.data ? 
          new Date(lembrete.data).toLocaleDateString('pt-BR') : 
          'Hoje'
        
        const valorFormatado = lembrete.valor ? 
          new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(lembrete.valor) : 
          ''

        const nomeUsuario = lembrete.profiles?.nome || 'Usuário'
        
        let mensagem = `🔔 *Lembrete Cash Flow*\n\n`
        mensagem += `Olá ${nomeUsuario}!\n\n`
        mensagem += `📝 *${lembrete.descricao}*\n`
        mensagem += `📅 Data: ${dataFormatada}\n`
        
        if (valorFormatado) {
          mensagem += `💰 Valor: ${valorFormatado}\n`
        }
        
        mensagem += `\n✅ Não esqueça de realizar este compromisso!\n\n`
        mensagem += `_Enviado automaticamente pelo Cash Flow_`

        // Aqui você pode integrar com sua API de WhatsApp preferida
        // Exemplo genérico - adapte conforme sua API
        const whatsappApiUrl = Deno.env.get('WHATSAPP_API_URL')
        const whatsappToken = Deno.env.get('WHATSAPP_API_TOKEN')

        if (whatsappApiUrl && whatsappToken) {
          const whatsappResponse = await fetch(whatsappApiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${whatsappToken}`
            },
            body: JSON.stringify({
              phone: whatsappNumber,
              message: mensagem
            })
          })

          if (!whatsappResponse.ok) {
            throw new Error(`Erro na API do WhatsApp: ${whatsappResponse.status}`)
          }

          console.log(`✅ WhatsApp enviado para ${whatsappNumber}`)
        } else {
          console.log(`📱 Simulando envio para ${whatsappNumber}: ${mensagem}`)
        }

        // Marcar como enviado
        const { error: updateError } = await supabaseClient
          .from('lembretes')
          .update({ whatsapp_notification_sent: true })
          .eq('id', lembrete.id)

        if (updateError) {
          console.error(`❌ Erro ao marcar lembrete ${lembrete.id} como enviado:`, updateError)
        }

        resultados.push({
          lembreteId: lembrete.id,
          success: true,
          message: 'Notificação enviada com sucesso'
        })

      } catch (error) {
        console.error(`❌ Erro ao processar lembrete ${lembrete.id}:`, error)
        resultados.push({
          lembreteId: lembrete.id,
          success: false,
          error: error.message
        })
      }
    }

    const sucessos = resultados.filter(r => r.success).length
    const erros = resultados.filter(r => !r.success).length

    console.log(`📊 Processamento concluído: ${sucessos} sucessos, ${erros} erros`)

    return new Response(
      JSON.stringify({
        message: `Processamento concluído: ${sucessos} sucessos, ${erros} erros`,
        results: resultados
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Erro geral na função:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
