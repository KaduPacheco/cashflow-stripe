
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      throw new Error('No Stripe signature found');
    }

    // For testing, you can skip signature verification
    // In production, you should verify the webhook signature
    let event;
    try {
      const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
      if (webhookSecret) {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } else {
        // Parse as JSON if no webhook secret (for testing)
        event = JSON.parse(body);
      }
    } catch (err) {
      logStep("Webhook signature verification failed", { error: err.message });
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    logStep("Processing event", { type: event.type, id: event.id });

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        logStep("Checkout completed", { sessionId: session.id, customerId: session.customer });
        
        if (session.mode === 'subscription' && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          await handleSubscriptionUpdate(supabaseClient, stripe, subscription, 'created');
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        await handleSubscriptionUpdate(supabaseClient, stripe, subscription, 'updated');
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await handleSubscriptionCancellation(supabaseClient, stripe, subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
          await handleSubscriptionUpdate(supabaseClient, stripe, subscription, 'payment_succeeded');
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        logStep("Payment failed", { invoiceId: invoice.id, customerId: invoice.customer });
        // Handle failed payment - could notify user or update status
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in stripe-webhook", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function handleSubscriptionUpdate(supabaseClient: any, stripe: Stripe, subscription: any, action: string) {
  try {
    logStep("Handling subscription update", { subscriptionId: subscription.id, action, status: subscription.status });

    const customer = await stripe.customers.retrieve(subscription.customer);
    if (!customer || customer.deleted) {
      logStep("Customer not found or deleted");
      return;
    }

    const email = customer.email;
    if (!email) {
      logStep("Customer email not found");
      return;
    }

    // Determine subscription tier from price
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

    const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
    const isActive = subscription.status === 'active';

    logStep("Updating subscriber", { 
      email, 
      subscribed: isActive, 
      tier: subscriptionTier,
      endDate: subscriptionEnd 
    });

    // Update subscribers table
    const { error } = await supabaseClient
      .from('subscribers')
      .upsert({
        email: email,
        stripe_customer_id: subscription.customer,
        subscribed: isActive,
        subscription_tier: subscriptionTier,
        subscription_end: subscriptionEnd,
        updated_at: new Date().toISOString(),
      }, { 
        onConflict: 'email',
        ignoreDuplicates: false 
      });

    if (error) {
      logStep("Error updating subscriber", { error: error.message });
      throw error;
    }

    logStep("Subscriber updated successfully");

  } catch (error) {
    logStep("Error in handleSubscriptionUpdate", { error: error.message });
    throw error;
  }
}

async function handleSubscriptionCancellation(supabaseClient: any, stripe: Stripe, subscription: any) {
  try {
    logStep("Handling subscription cancellation", { subscriptionId: subscription.id });

    const customer = await stripe.customers.retrieve(subscription.customer);
    if (!customer || customer.deleted) return;

    const email = customer.email;
    if (!email) return;

    // Update subscriber to inactive
    const { error } = await supabaseClient
      .from('subscribers')
      .update({
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
        updated_at: new Date().toISOString(),
      })
      .eq('email', email);

    if (error) {
      logStep("Error updating cancelled subscription", { error: error.message });
      throw error;
    }

    logStep("Subscription cancelled successfully");

  } catch (error) {
    logStep("Error in handleSubscriptionCancellation", { error: error.message });
    throw error;
  }
}
