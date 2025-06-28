
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { 
  ValidationException, 
  validateAuthToken, 
  validateEmail,
  validateUUID,
  checkRateLimit,
  logValidationError
} from "../_shared/validation.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  // Sanitizar detalhes para log seguro
  const safeDetails = details ? JSON.stringify(details).slice(0, 500) : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${safeDetails ? ` - ${safeDetails}` : ''}`);
};

// Função para determinar status baseado na assinatura
const determineSubscriptionStatus = (subscription: any, subscriptionEnd: string) => {
  const now = new Date();
  const endDate = new Date(subscriptionEnd);
  
  if (subscription.status === 'active' && endDate > now) {
    return 'active';
  } else if (subscription.status === 'trialing') {
    return 'trialing';
  } else if (subscription.status === 'past_due') {
    return 'past_due';
  } else if (subscription.status === 'canceled') {
    return 'canceled';
  } else if (endDate <= now) {
    return 'expired';
  }
  
  return 'unknown';
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const startTime = Date.now();

  try {
    logStep("Function started", { ip: clientIP });

    // Verificar configuração crítica primeiro
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!stripeKey || stripeKey.length < 10) {
      logStep("ERROR: STRIPE_SECRET_KEY not configured properly");
      return new Response(JSON.stringify({ 
        subscribed: false,
        error: "Serviço de assinatura temporariamente indisponível",
        errorType: "configuration"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      logStep("ERROR: Supabase configuration incomplete");
      return new Response(JSON.stringify({ 
        subscribed: false,
        error: "Serviço temporariamente indisponível",
        errorType: "configuration"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("Environment variables verified");

    // Rate limiting
    try {
      checkRateLimit(clientIP, 20, 60000); // Reduzido para 20 requests por minuto
    } catch (rateLimitError) {
      logStep("Rate limit exceeded", { ip: clientIP });
      return new Response(JSON.stringify({ 
        subscribed: false,
        error: "Muitas tentativas. Aguarde antes de tentar novamente.",
        errorType: "rate_limit"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Criar clientes Supabase
    const supabaseClient = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
    const authClient = createClient(supabaseUrl, anonKey);

    // Validar cabeçalho de autorização
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logStep("No authorization header - returning unsubscribed");
      return new Response(JSON.stringify({ 
        subscribed: false,
        error: "Autenticação necessária",
        errorType: "session"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Validar token
    let validatedToken: string;
    try {
      const token = authHeader.replace("Bearer ", "");
      validatedToken = validateAuthToken(token);
      logStep("Authorization header validated");
    } catch (tokenError) {
      logStep("Invalid token format", { error: tokenError.message });
      return new Response(JSON.stringify({ 
        subscribed: false,
        error: "Token de autenticação inválido",
        errorType: "session"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Autenticar usuário com timeout
    let userData: any;
    try {
      const authPromise = authClient.auth.getUser(validatedToken);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth timeout')), 8000) // 8 segundos timeout
      );
      
      const { data, error: userError } = await Promise.race([authPromise, timeoutPromise]) as any;
      
      if (userError) {
        logStep("Authentication error", { error: userError.message });
        return new Response(JSON.stringify({ 
          subscribed: false,
          error: "Sessão expirada ou inválida",
          errorType: "session"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      userData = data;
    } catch (authError) {
      logStep("Auth client error/timeout", { error: authError.message });
      return new Response(JSON.stringify({ 
        subscribed: false,
        error: "Erro no serviço de autenticação ou timeout",
        errorType: "session"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    const user = userData.user;
    if (!user?.email) {
      logStep("No user email found");
      return new Response(JSON.stringify({ 
        subscribed: false,
        error: "Autenticação incompleta do usuário",
        errorType: "session"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Validar dados do usuário
    let validatedEmail: string;
    let validatedUserId: string;
    try {
      validatedEmail = validateEmail(user.email);
      validatedUserId = validateUUID(user.id, "user_id");
    } catch (validationError) {
      logStep("User data validation failed", { error: validationError.message });
      return new Response(JSON.stringify({ 
        subscribed: false,
        error: "Dados do usuário inválidos",
        errorType: "session"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    logStep("User authenticated successfully", { 
      userId: validatedUserId.slice(0, 8) + "...",
      emailDomain: validatedEmail.split('@')[1] 
    });

    let stripe: Stripe;
    try {
      stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    } catch (stripeError) {
      logStep("Stripe initialization error", { error: stripeError.message });
      return new Response(JSON.stringify({ 
        subscribed: false,
        error: "Serviço de pagamento indisponível",
        errorType: "service"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    // Buscar cliente no Stripe com timeout
    let customers: any;
    try {
      const stripePromise = stripe.customers.list({ email: validatedEmail, limit: 1 });
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Stripe timeout')), 8000) // 8 segundos timeout
      );
      
      customers = await Promise.race([stripePromise, timeoutPromise]);
    } catch (stripeApiError) {
      logStep("Stripe API error/timeout", { error: stripeApiError.message });
      return new Response(JSON.stringify({ 
        subscribed: false,
        error: "Não foi possível verificar status da assinatura - timeout",
        errorType: "service"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    if (customers.data.length === 0) {
      logStep("No customer found, updating unsubscribed state");
      try {
        await supabaseClient.from("subscribers").upsert({
          email: validatedEmail,
          user_id: validatedUserId,
          stripe_customer_id: null,
          subscribed: false,
          subscription_tier: null,
          subscription_end: null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'email' });
        
        await supabaseClient.from("profiles").upsert({
          id: validatedUserId,
          email: validatedEmail,
          assinaturaId: null,
          updated_at: new Date().toISOString(),
        });
      } catch (dbError) {
        logStep("Database update error (no customer)", { error: dbError.message });
      }
      
      return new Response(JSON.stringify({ 
        subscribed: false,
        status: 'no_customer',
        message: 'Nenhuma assinatura encontrada'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId: customerId.slice(0, 8) + "..." });

    let subscriptions: any;
    try {
      const subscriptionPromise = stripe.subscriptions.list({
        customer: customerId,
        status: "all", // Buscar todas as assinaturas para análise completa
        limit: 5,
      });
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Subscription timeout')), 8000)
      );
      
      subscriptions = await Promise.race([subscriptionPromise, timeoutPromise]);
    } catch (subscriptionError) {
      logStep("Stripe subscription query error/timeout", { error: subscriptionError.message });
      return new Response(JSON.stringify({ 
        subscribed: false,
        error: "Não foi possível verificar status da assinatura - timeout",
        errorType: "service"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    // Analisar assinaturas para encontrar a mais relevante
    const activeSubscriptions = subscriptions.data.filter((sub: any) => 
      ['active', 'trialing', 'past_due'].includes(sub.status)
    );
    
    const hasActiveSub = activeSubscriptions.length > 0;
    let subscriptionTier = null;
    let subscriptionEnd = null;
    let subscriptionId = null;
    let subscriptionStatus = 'inactive';
    let detailedStatus = 'no_subscription';

    if (hasActiveSub) {
      const subscription = activeSubscriptions[0]; // Pegar a primeira assinatura ativa
      subscriptionId = subscription.id;
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      subscriptionTier = "Premium";
      subscriptionStatus = determineSubscriptionStatus(subscription, subscriptionEnd);
      detailedStatus = subscriptionStatus;
      
      logStep("Active subscription found", { 
        subscriptionId: subscriptionId.slice(0, 8) + "...", 
        endDate: subscriptionEnd,
        status: subscriptionStatus
      });
    } else if (subscriptions.data.length > 0) {
      // Tem assinaturas mas nenhuma ativa
      const lastSubscription = subscriptions.data[0];
      subscriptionStatus = lastSubscription.status;
      detailedStatus = subscriptionStatus;
      logStep("Inactive subscription found", { status: subscriptionStatus });
    } else {
      logStep("No subscriptions found");
    }

    // Update database
    try {
      await supabaseClient.from("subscribers").upsert({
        email: validatedEmail,
        user_id: validatedUserId,
        stripe_customer_id: customerId,
        subscribed: hasActiveSub,
        subscription_tier: subscriptionTier,
        subscription_end: subscriptionEnd,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });

      await supabaseClient.from("profiles").upsert({
        id: validatedUserId,
        email: validatedEmail,
        assinaturaId: subscriptionId,
        updated_at: new Date().toISOString(),
      });

      const processingTime = Date.now() - startTime;
      logStep("Updated database with subscription info", { 
        subscribed: hasActiveSub, 
        subscriptionTier, 
        subscriptionId: subscriptionId?.slice(0, 8) + "...",
        processingTime: `${processingTime}ms`
      });
    } catch (dbError) {
      logStep("Database update error", { error: dbError.message });
    }
    
    const response = {
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      subscription_id: subscriptionId,
      status: detailedStatus,
      message: hasActiveSub ? 'Assinatura ativa' : 'Assinatura inativa'
    };
    
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error) {
    if (error instanceof ValidationException) {
      logValidationError("check-subscription", error, clientIP);
      return new Response(JSON.stringify({ 
        subscribed: false,
        error: "Parâmetros de solicitação inválidos",
        errorType: "validation"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    const processingTime = Date.now() - startTime;
    logStep("ERROR in check-subscription", { 
      message: errorMessage.slice(0, 200),
      processingTime: `${processingTime}ms`
    });
    
    return new Response(JSON.stringify({ 
      subscribed: false,
      error: "Verificação de assinatura temporariamente indisponível",
      errorType: "unknown"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
