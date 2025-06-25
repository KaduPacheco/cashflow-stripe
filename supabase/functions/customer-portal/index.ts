
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { 
  ValidationException, 
  validateAuthToken, 
  validateEmail,
  validateUUID,
  validateOrigin,
  checkRateLimit,
  logValidationError
} from "../_shared/validation.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const safeDetails = details ? JSON.stringify(details).slice(0, 500) : '';
  console.log(`[CUSTOMER-PORTAL] ${step}${safeDetails ? ` - ${safeDetails}` : ''}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

  try {
    logStep("Function started", { ip: clientIP });

    // Rate limiting
    checkRateLimit(clientIP, 10, 60000); // 10 requests per minute per IP

    // Validar configuração do Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey || stripeKey.length < 10) {
      throw new Error("STRIPE_SECRET_KEY não está configurada adequadamente");
    }
    logStep("Stripe key verified");

    // Inicializar cliente Supabase com service role key
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

    // Verificar cabeçalho de autorização
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ValidationException([{ field: "authorization", message: "No authorization header provided" }]);
    }
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const validatedToken = validateAuthToken(token);
    
    // Autenticar usuário
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(validatedToken);
    if (userError) {
      throw new ValidationException([{ field: "authentication", message: "Authentication failed" }]);
    }
    
    const user = userData.user;
    if (!user?.email) {
      throw new ValidationException([{ field: "user", message: "User not authenticated or email not available" }]);
    }

    // Validar dados do usuário
    const validatedEmail = validateEmail(user.email);
    const validatedUserId = validateUUID(user.id, "user_id");
    
    logStep("User authenticated", { 
      userId: validatedUserId.slice(0, 8) + "...", 
      emailDomain: validatedEmail.split('@')[1] 
    });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Buscar cliente no Stripe
    const customers = await stripe.customers.list({ email: validatedEmail, limit: 1 });
    if (customers.data.length === 0) {
      throw new ValidationException([{ field: "customer", message: "No Stripe customer found for this user" }]);
    }
    
    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId: customerId.slice(0, 8) + "..." });

    // Validar origem
    const origin = validateOrigin(req.headers.get("origin"));
    
    // Criar sessão do portal do cliente
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/perfil`,
    });
    
    logStep("Customer portal session created", { 
      sessionId: portalSession.id.slice(0, 8) + "...", 
      url: portalSession.url ? "URL_CREATED" : "NO_URL" 
    });

    return new Response(JSON.stringify({ url: portalSession.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    if (error instanceof ValidationException) {
      logValidationError("customer-portal", error, clientIP);
      return new Response(JSON.stringify({ 
        error: "Invalid request parameters" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in customer-portal", { message: errorMessage.slice(0, 200) });
    
    return new Response(JSON.stringify({ 
      error: "Internal server error" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
