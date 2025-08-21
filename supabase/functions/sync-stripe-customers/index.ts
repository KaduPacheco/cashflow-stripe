
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SYNC-STRIPE-CUSTOMERS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Iniciando sincronização completa dos clientes Stripe");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY não configurada");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verificar se o usuário é admin (opcional)
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await supabaseClient.auth.getUser(token);
      logStep("Requisição do usuário", { userId: userData.user?.id, email: userData.user?.email });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    let sincronizados = 0;
    let assinaturasProcessadas = 0;
    let erros = 0;
    const resultados = [];

    // Buscar todos os clientes do Stripe
    logStep("Buscando todos os clientes do Stripe");
    
    let hasMore = true;
    let startingAfter = undefined;
    
    while (hasMore) {
      const customers = await stripe.customers.list({
        limit: 100,
        starting_after: startingAfter,
      });
      
      logStep(`Processando lote de ${customers.data.length} clientes`);
      
      for (const customer of customers.data) {
        try {
          if (!customer.email) {
            logStep("Pulando cliente sem email", { customerId: customer.id });
            continue;
          }

          // Buscar assinaturas ativas do cliente
          const subscriptions = await stripe.subscriptions.list({
            customer: customer.id,
            limit: 10,
          });

          let subscriptionTier = null;
          let subscriptionEnd = null;
          let subscriptionStatus = null;
          const hasActiveSub = subscriptions.data.some(sub => sub.status === 'active');

          // Processar a assinatura mais recente
          if (subscriptions.data.length > 0) {
            const subscription = subscriptions.data[0];
            subscriptionStatus = subscription.status;
            
            if (subscription.status === 'active') {
              subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
              
              // Determinar tier baseado no preço
              if (subscription.items?.data?.[0]) {
                const priceId = subscription.items.data[0].price.id;
                const price = await stripe.prices.retrieve(priceId);
                const amount = price.unit_amount || 0;
                
                if (amount <= 999) {
                  subscriptionTier = "Basic";
                } else if (amount <= 2999) {
                  subscriptionTier = "Premium";
                } else {
                  subscriptionTier = "VIP";
                }
              }
            }
            
            assinaturasProcessadas++;
          }

          // Buscar perfil do usuário pelo email
          const { data: profile } = await supabaseClient
            .from('profiles')
            .select('id')
            .eq('email', customer.email)
            .single();

          // Atualizar/inserir na tabela subscribers
          const { error: upsertError } = await supabaseClient
            .from('subscribers')
            .upsert({
              email: customer.email,
              user_id: profile?.id || null,
              stripe_customer_id: customer.id,
              subscribed: hasActiveSub,
              subscription_tier: subscriptionTier,
              subscription_end: subscriptionEnd,
              updated_at: new Date().toISOString(),
            }, { 
              onConflict: 'email',
              ignoreDuplicates: false 
            });

          if (upsertError) {
            logStep("Erro ao atualizar subscriber", { email: customer.email, error: upsertError.message });
            erros++;
          } else {
            sincronizados++;
            resultados.push({
              email: customer.email,
              customerId: customer.id,
              subscribed: hasActiveSub,
              tier: subscriptionTier,
              status: subscriptionStatus,
              hasProfile: !!profile?.id
            });
          }

        } catch (customerError) {
          logStep("Erro ao processar cliente", { customerId: customer.id, error: customerError.message });
          erros++;
        }
      }
      
      hasMore = customers.has_more;
      if (hasMore && customers.data.length > 0) {
        startingAfter = customers.data[customers.data.length - 1].id;
      }
    }

    // Verificar sessões de checkout recentes para capturar pagamentos não processados
    logStep("Verificando sessões de checkout recentes");
    const sessionsRecentes = await stripe.checkout.sessions.list({
      limit: 100,
      created: {
        gte: Math.floor((Date.now() - 90 * 24 * 60 * 60 * 1000) / 1000) // Últimos 90 dias
      }
    });

    let sessoesProcessadas = 0;
    for (const session of sessionsRecentes.data) {
      if (session.mode === 'subscription' && session.subscription && session.customer) {
        try {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          const customer = await stripe.customers.retrieve(session.customer as string);
          
          if (!customer.deleted && customer.email) {
            // Verificar se o subscriber já foi processado corretamente
            const { data: existingSubscriber } = await supabaseClient
              .from('subscribers')
              .select('*')
              .eq('email', customer.email)
              .single();

            if (!existingSubscriber || !existingSubscriber.subscribed || !existingSubscriber.subscription_tier) {
              logStep("Processando assinatura perdida do checkout", { 
                sessionId: session.id, 
                email: customer.email 
              });

              let subscriptionTier = "Premium";
              if (subscription.items?.data?.[0]) {
                const priceId = subscription.items.data[0].price.id;
                const price = await stripe.prices.retrieve(priceId);
                const amount = price.unit_amount || 0;
                
                if (amount <= 999) {
                  subscriptionTier = "Basic";
                } else if (amount <= 2999) {
                  subscriptionTier = "Premium";
                } else {
                  subscriptionTier = "VIP";
                }
              }

              const { data: profile } = await supabaseClient
                .from('profiles')
                .select('id')
                .eq('email', customer.email)
                .single();

              await supabaseClient
                .from('subscribers')
                .upsert({
                  email: customer.email,
                  user_id: profile?.id || null,
                  stripe_customer_id: customer.id,
                  subscribed: subscription.status === 'active',
                  subscription_tier: subscriptionTier,
                  subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
                  updated_at: new Date().toISOString(),
                }, { onConflict: 'email' });

              sessoesProcessadas++;
            }
          }
        } catch (sessionError) {
          logStep("Erro ao processar sessão", { sessionId: session.id, error: sessionError.message });
        }
      }
    }

    // Estatísticas finais
    const resumo = {
      clientesSincronizados: sincronizados,
      assinaturasProcessadas,
      sessoesProcessadas,
      erros,
      totalProcessado: resultados.length,
      assinaturasAtivas: resultados.filter(r => r.subscribed).length,
      usuariosPremium: resultados.filter(r => r.tier === 'Premium').length,
      usuariosVIP: resultados.filter(r => r.tier === 'VIP').length,
      usuariosSemPerfil: resultados.filter(r => !r.hasProfile).length,
    };

    logStep("Sincronização concluída", resumo);

    // Retornar apenas alguns exemplos para evitar resposta muito grande
    const exemplos = resultados
      .filter(r => r.subscribed)
      .slice(0, 20)
      .map(r => ({
        email: r.email.substring(0, 3) + '***', // Mascarar email por segurança
        tier: r.tier,
        status: r.status
      }));

    return new Response(JSON.stringify({
      sucesso: true,
      mensagem: "Clientes Stripe sincronizados com sucesso",
      resumo,
      exemplosAtivos: exemplos
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERRO na sincronização", { mensagem: errorMessage });
    
    return new Response(JSON.stringify({ 
      sucesso: false,
      erro: errorMessage,
      mensagem: "Falha na sincronização dos clientes Stripe"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
