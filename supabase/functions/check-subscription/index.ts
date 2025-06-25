
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

  try {
    logStep("Function started", { ip: clientIP });

    // Rate limiting
    checkRateLimit(clientIP, 30, 60000); // 30 requests per minute per IP

    // Validar configuração do Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey || stripeKey.length < 10) {
      throw new Error("STRIPE_SECRET_KEY não está configurada adequadamente");
    }
    logStep("Stripe key verified");

    // Criar cliente Supabase com service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Configuração do Supabase incompleta");
    }

    const supabaseClient = createClient(
      supabaseUrl,
      serviceRoleKey,
      { auth: { persistSession: false } }
    );

    // Validar cabeçalho de autorização
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logStep("No authorization header - returning unsubscribed");
      return new Response(JSON.stringify({ 
        subscribed: false,
        error: "No authorization provided" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Validar e sanitizar token
    const token = authHeader.replace("Bearer ", "");
    const validatedToken = validateAuthToken(token);
    
    logStep("Authorization header found and validated");

    // Autenticar usuário com Supabase anon key para validação de token
    const authClient = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    
    const { data: userData, error: userError } = await authClient.auth.getUser(validatedToken);
    
    if (userError || !userData.user) {
      logStep("Authentication error or user not found", { 
        error: userError?.message, 
        hasUser: !!userData.user 
      });
      
      return new Response(JSON.stringify({ 
        subscribed: false,
        error: "User not authenticated"
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
        error: "User email not available" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Validar email do usuário
    const validatedEmail = validateEmail(user.email);
    const validatedUserId = validateUUID(user.id, "user_id");
    
    logStep("User authenticated successfully", { 
      userId: validatedUserId.slice(0, 8) + "...", // Log parcial por segurança
      emailDomain: validatedEmail.split('@')[1] 
    });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Buscar cliente no Stripe com validação
    const customers = await stripe.customers.list({ 
      email: validatedEmail, 
      limit: 1 
    });
    
    if (customers.data.length === 0) {
      logStep("No customer found, updating unsubscribed state");
      await supabaseClient.from("subscribers").upsert({
        email: validatedEmail,
        user_id: validatedUserId,
        stripe_customer_id: null,
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });
      
      // Update profile with null assinaturaId
      await supabaseClient.from("profiles").upsert({
        id: validatedUserId,
        email: validatedEmail,
        assinaturaId: null,
        updated_at: new Date().toISOString(),
      });
      
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId: customerId.slice(0, 8) + "..." });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    
    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionTier = null;
    let subscriptionEnd = null;
    let subscriptionId = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionId = subscription.id;
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      subscriptionTier = "Premium";
      logStep("Active subscription found", { 
        subscriptionId: subscriptionId.slice(0, 8) + "...", 
        endDate: subscriptionEnd 
      });
    } else {
      logStep("No active subscription found");
    }

    // Update subscribers table
    await supabaseClient.from("subscribers").upsert({
      email: validatedEmail,
      user_id: validatedUserId,
      stripe_customer_id: customerId,
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'email' });

    // Update profile with assinaturaId
    await supabaseClient.from("profiles").upsert({
      id: validatedUserId,
      email: validatedEmail,
      assinaturaId: subscriptionId,
      updated_at: new Date().toISOString(),
    });

    logStep("Updated database with subscription info", { 
      subscribed: hasActiveSub, 
      subscriptionTier, 
      subscriptionId: subscriptionId?.slice(0, 8) + "..." 
    });
    
    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      subscription_id: subscriptionId
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    if (error instanceof ValidationException) {
      logValidationError("check-subscription", error, clientIP);
      return new Response(JSON.stringify({ 
        subscribed: false,
        error: "Invalid request parameters"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage.slice(0, 200) });
    
    // Retornar sempre status 200 com subscribed: false em caso de erro
    return new Response(JSON.stringify({ 
      subscribed: false,
      error: "Internal server error" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
