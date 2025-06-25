
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
    try {
      checkRateLimit(clientIP, 30, 60000); // 30 requests per minute per IP
    } catch (rateLimitError) {
      logStep("Rate limit exceeded", { ip: clientIP });
      return new Response(JSON.stringify({ 
        subscribed: false,
        error: "Request rate limit exceeded. Please wait before trying again.",
        errorType: "rate_limit"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // Return 200 to avoid triggering edge function error in frontend
      });
    }

    // Validar configuração do Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey || stripeKey.length < 10) {
      logStep("ERROR: STRIPE_SECRET_KEY not configured properly");
      return new Response(JSON.stringify({ 
        subscribed: false,
        error: "Subscription service temporarily unavailable",
        errorType: "configuration"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    logStep("Stripe key verified");

    // Criar cliente Supabase com service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !serviceRoleKey) {
      logStep("ERROR: Supabase configuration incomplete");
      return new Response(JSON.stringify({ 
        subscribed: false,
        error: "Service temporarily unavailable",
        errorType: "configuration"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
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
        error: "Authentication required",
        errorType: "session"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Validar e sanitizar token
    let validatedToken: string;
    try {
      const token = authHeader.replace("Bearer ", "");
      validatedToken = validateAuthToken(token);
      logStep("Authorization header found and validated");
    } catch (tokenError) {
      logStep("Invalid token format", { error: tokenError.message });
      return new Response(JSON.stringify({ 
        subscribed: false,
        error: "Invalid authentication token",
        errorType: "session"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Autenticar usuário com Supabase anon key para validação de token
    const authClient = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    
    let userData: any;
    try {
      const { data, error: userError } = await authClient.auth.getUser(validatedToken);
      
      if (userError) {
        logStep("Authentication error", { error: userError.message });
        return new Response(JSON.stringify({ 
          subscribed: false,
          error: "Session expired or invalid",
          errorType: "session"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      userData = data;
    } catch (authError) {
      logStep("Auth client error", { error: authError.message });
      return new Response(JSON.stringify({ 
        subscribed: false,
        error: "Authentication service error",
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
        error: "User authentication incomplete",
        errorType: "session"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Validar email do usuário
    let validatedEmail: string;
    let validatedUserId: string;
    try {
      validatedEmail = validateEmail(user.email);
      validatedUserId = validateUUID(user.id, "user_id");
    } catch (validationError) {
      logStep("User data validation failed", { error: validationError.message });
      return new Response(JSON.stringify({ 
        subscribed: false,
        error: "Invalid user data",
        errorType: "session"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    logStep("User authenticated successfully", { 
      userId: validatedUserId.slice(0, 8) + "...", // Log parcial por segurança
      emailDomain: validatedEmail.split('@')[1] 
    });

    let stripe: Stripe;
    try {
      stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    } catch (stripeError) {
      logStep("Stripe initialization error", { error: stripeError.message });
      return new Response(JSON.stringify({ 
        subscribed: false,
        error: "Payment service unavailable",
        errorType: "service"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    // Buscar cliente no Stripe com validação
    let customers: any;
    try {
      customers = await stripe.customers.list({ 
        email: validatedEmail, 
        limit: 1 
      });
    } catch (stripeApiError) {
      logStep("Stripe API error", { error: stripeApiError.message });
      return new Response(JSON.stringify({ 
        subscribed: false,
        error: "Unable to verify subscription status",
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
        
        // Update profile with null assinaturaId
        await supabaseClient.from("profiles").upsert({
          id: validatedUserId,
          email: validatedEmail,
          assinaturaId: null,
          updated_at: new Date().toISOString(),
        });
      } catch (dbError) {
        logStep("Database update error (no customer)", { error: dbError.message });
        // Don't fail the request for database errors
      }
      
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId: customerId.slice(0, 8) + "..." });

    let subscriptions: any;
    try {
      subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 1,
      });
    } catch (subscriptionError) {
      logStep("Stripe subscription query error", { error: subscriptionError.message });
      return new Response(JSON.stringify({ 
        subscribed: false,
        error: "Unable to check subscription status",
        errorType: "service"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
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
    } catch (dbError) {
      logStep("Database update error", { error: dbError.message });
      // Don't fail the request for database errors, just log them
    }
    
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
        error: "Invalid request parameters",
        errorType: "validation"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // Return 200 to avoid edge function error
      });
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage.slice(0, 200) });
    
    // Sempre retornar status 200 com subscribed: false em caso de erro
    return new Response(JSON.stringify({ 
      subscribed: false,
      error: "Subscription verification temporarily unavailable",
      errorType: "unknown"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
