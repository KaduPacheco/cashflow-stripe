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
  console.log(`[CREATE-CHECKOUT-VIP] ${step}${safeDetails ? ` - ${safeDetails}` : ''}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

  try {
    logStep("VIP checkout function started", { ip: clientIP });

    // Rate limiting
    checkRateLimit(clientIP, 5, 60000);

    // Validar configuração Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey || stripeKey.length < 10) {
      throw new Error("STRIPE_SECRET_KEY não configurada");
    }

    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !anonKey) {
      throw new Error("Configuração do Supabase incompleta");
    }

    const supabaseClient = createClient(supabaseUrl, anonKey);

    // Autenticação
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ValidationException([{ field: "authorization", message: "No authorization header" }]);
    }

    const token = authHeader.replace("Bearer ", "");
    const validatedToken = validateAuthToken(token);
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(validatedToken);
    
    if (userError || !userData.user?.email) {
      throw new ValidationException([{ field: "authentication", message: "Authentication failed" }]);
    }
    
    const user = userData.user;
    const validatedEmail = validateEmail(user.email);
    const validatedUserId = validateUUID(user.id, "user_id");
    
    logStep("User authenticated for VIP checkout", { 
      userId: validatedUserId.slice(0, 8) + "...", 
      emailDomain: validatedEmail.split('@')[1] 
    });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Verificar cliente existente
    const customers = await stripe.customers.list({ email: validatedEmail, limit: 1 });
    let customerId = customers.data.length > 0 ? customers.data[0].id : undefined;

    const origin = validateOrigin(req.headers.get("origin"));
    
    // 🔒 CHECKOUT VIP - Price ID fixo
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : validatedEmail,
      line_items: [
        {
          price: 'price_1RlVapH5wZPXEK4CHPfKL9vH', // Price ID VIP (fixo)
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/dashboard?checkout=success&plan=vip`,
      cancel_url: `${origin}/plano-vip?checkout=canceled`,
      metadata: {
        user_id: validatedUserId,
        plan_type: 'vip', // Marca especial para identificação
      },
      payment_method_types: ['card'],
      billing_address_collection: 'required',
    });

    logStep("VIP checkout session created", { 
      sessionId: session.id.slice(0, 8) + "...",
      priceId: 'price_1RlVapH5wZPXEK4CHPfKL9vH'
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    if (error instanceof ValidationException) {
      logValidationError("create-checkout-vip", error, clientIP);
      return new Response(JSON.stringify({ 
        error: "Invalid request parameters" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout-vip", { message: errorMessage.slice(0, 200) });
    
    return new Response(JSON.stringify({ 
      error: "Internal server error" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
