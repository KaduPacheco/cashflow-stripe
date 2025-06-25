
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
  console.log(`[CREATE-CHECKOUT] ${step}${safeDetails ? ` - ${safeDetails}` : ''}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

  try {
    logStep("Function started", { ip: clientIP });

    // Rate limiting mais restritivo para checkout
    checkRateLimit(clientIP, 5, 60000); // 5 requests per minute per IP

    // Verificar se a chave do Stripe está configurada
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey || stripeKey.length < 10) {
      throw new Error("STRIPE_SECRET_KEY não está configurada adequadamente");
    }
    logStep("Stripe key verified");

    // Criar cliente Supabase com chave anon para autenticação
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !anonKey) {
      throw new Error("Configuração do Supabase incompleta");
    }

    const supabaseClient = createClient(supabaseUrl, anonKey);

    // Verificar cabeçalho de autorização
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ValidationException([{ field: "authorization", message: "No authorization header provided" }]);
    }
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const validatedToken = validateAuthToken(token);
    
    logStep("Attempting to authenticate user", { tokenLength: validatedToken.length });

    // Tentar autenticar o usuário
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(validatedToken);
    
    if (userError) {
      logStep("Authentication error", { error: userError.message, code: userError.status });
      throw new ValidationException([{ field: "authentication", message: "Authentication failed" }]);
    }
    
    const user = userData.user;
    if (!user?.email) {
      logStep("No user or email found", { hasUser: !!user, userKeys: user ? Object.keys(user) : [] });
      throw new ValidationException([{ field: "user", message: "User not authenticated or email not available" }]);
    }

    // Validar dados do usuário
    const validatedEmail = validateEmail(user.email);
    const validatedUserId = validateUUID(user.id, "user_id");
    
    logStep("User authenticated successfully", { 
      userId: validatedUserId.slice(0, 8) + "...", 
      emailDomain: validatedEmail.split('@')[1] 
    });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Verificar se o cliente já existe no Stripe
    const customers = await stripe.customers.list({ email: validatedEmail, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId: customerId.slice(0, 8) + "..." });
    } else {
      logStep("No existing customer found, will create new one");
    }

    // Validar origem para URLs de retorno
    const origin = validateOrigin(req.headers.get("origin"));
    
    // Criar sessão de checkout com validação
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : validatedEmail,
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: { 
              name: "Plano Agente Financeiro",
              description: "Acesso completo ao sistema de gestão financeira"
            },
            unit_amount: 3490, // R$ 34,90 - valor fixo para evitar manipulação
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/dashboard?checkout=success`,
      cancel_url: `${origin}/plano?checkout=canceled`,
      metadata: {
        user_id: validatedUserId,
      },
      // Configurações de segurança adicionais
      payment_method_types: ['card'], // Limitar a cartões
      billing_address_collection: 'required',
    });

    logStep("Checkout session created successfully", { 
      sessionId: session.id.slice(0, 8) + "...", 
      url: session.url ? "URL_CREATED" : "NO_URL" 
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    if (error instanceof ValidationException) {
      logValidationError("create-checkout", error, clientIP);
      return new Response(JSON.stringify({ 
        error: "Invalid request parameters" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage.slice(0, 200) });
    
    return new Response(JSON.stringify({ 
      error: "Internal server error" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
