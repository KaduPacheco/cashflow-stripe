
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
    logStep("Starting Stripe customers synchronization");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verificar se o usuário é admin (opcional - pode ser removido se quiser permitir acesso geral)
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await supabaseClient.auth.getUser(token);
      logStep("Request from user", { userId: userData.user?.id, email: userData.user?.email });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    let syncedCustomers = 0;
    let processedSubscriptions = 0;
    let errors = 0;
    const syncResults = [];

    // Buscar todos os clientes do Stripe
    logStep("Fetching all Stripe customers");
    
    let hasMore = true;
    let startingAfter = undefined;
    
    while (hasMore) {
      const customers = await stripe.customers.list({
        limit: 100,
        starting_after: startingAfter,
      });
      
      logStep(`Processing batch of ${customers.data.length} customers`);
      
      for (const customer of customers.data) {
        try {
          if (!customer.email) {
            logStep("Skipping customer without email", { customerId: customer.id });
            continue;
          }

          // Buscar assinaturas ativas do cliente
          const subscriptions = await stripe.subscriptions.list({
            customer: customer.id,
            status: "active",
            limit: 10,
          });

          let subscriptionTier = null;
          let subscriptionEnd = null;
          let subscriptionId = null;
          const hasActiveSub = subscriptions.data.length > 0;

          if (hasActiveSub) {
            const subscription = subscriptions.data[0];
            subscriptionId = subscription.id;
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
            
            processedSubscriptions++;
          }

          // Buscar o usuário no sistema pelo email
          const { data: profile } = await supabaseClient
            .from('profiles')
            .select('id')
            .eq('email', customer.email)
            .single();

          // Atualizar ou inserir na tabela subscribers
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
            logStep("Error upserting subscriber", { email: customer.email, error: upsertError.message });
            errors++;
          } else {
            syncedCustomers++;
            syncResults.push({
              email: customer.email,
              customerId: customer.id,
              subscribed: hasActiveSub,
              tier: subscriptionTier,
              hasProfile: !!profile?.id
            });
          }

        } catch (customerError) {
          logStep("Error processing customer", { customerId: customer.id, error: customerError.message });
          errors++;
        }
      }
      
      hasMore = customers.has_more;
      if (hasMore && customers.data.length > 0) {
        startingAfter = customers.data[customers.data.length - 1].id;
      }
    }

    // Buscar sessões de checkout recentes para capturar pagamentos que podem não ter sido processados
    logStep("Checking recent checkout sessions");
    const recentSessions = await stripe.checkout.sessions.list({
      limit: 100,
      created: {
        gte: Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000) // Últimos 30 dias
      }
    });

    let processedSessions = 0;
    for (const session of recentSessions.data) {
      if (session.mode === 'subscription' && session.subscription && session.customer) {
        try {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          const customer = await stripe.customers.retrieve(session.customer as string);
          
          if (!customer.deleted && customer.email) {
            // Processar esta assinatura se ainda não foi processada
            const { data: existingSubscriber } = await supabaseClient
              .from('subscribers')
              .select('*')
              .eq('email', customer.email)
              .single();

            if (!existingSubscriber || !existingSubscriber.subscribed) {
              logStep("Processing missed subscription from checkout", { 
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

              processedSessions++;
            }
          }
        } catch (sessionError) {
          logStep("Error processing session", { sessionId: session.id, error: sessionError.message });
        }
      }
    }

    const summary = {
      syncedCustomers,
      processedSubscriptions,
      processedSessions,
      errors,
      totalProcessed: syncResults.length,
      activeSubscriptions: syncResults.filter(r => r.subscribed).length,
      premiumUsers: syncResults.filter(r => r.tier === 'Premium').length,
      vipUsers: syncResults.filter(r => r.tier === 'VIP').length,
      usersWithoutProfile: syncResults.filter(r => !r.hasProfile).length,
    };

    logStep("Synchronization completed", summary);

    return new Response(JSON.stringify({
      success: true,
      message: "Stripe customers synchronized successfully",
      summary,
      details: syncResults.slice(0, 50) // Limitar detalhes para evitar resposta muito grande
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in sync-stripe-customers", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage,
      message: "Falha na sincronização dos clientes Stripe"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
