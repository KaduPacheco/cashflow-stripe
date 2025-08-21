
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Mapeamento de preços para tiers - corrigido para usar a tabela subscribers
const tierMapping: Record<string, string> = {
  'price_1RbPYoHVDJ85Dm6EzXjQsclN': 'VIP',  // VIP price ID (invisível)
  // Adicione outros price IDs Premium aqui conforme necessário
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details).slice(0, 500)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
}

serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      logStep('ERROR: Missing stripe-signature header')
      return new Response('Missing stripe-signature header', { status: 400 })
    }

    const body = await req.text()
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    logStep('Webhook event received', { type: event.type, id: event.id })

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        logStep('Processing subscription event', { 
          subscriptionId: subscription.id, 
          status: subscription.status,
          customerId: subscription.customer 
        })
        
        // Get customer email to find user
        let customer
        try {
          customer = await stripe.customers.retrieve(subscription.customer as string)
        } catch (error) {
          logStep('ERROR: Failed to retrieve customer', { error: error.message, customerId: subscription.customer })
          return new Response('Failed to retrieve customer', { status: 400 })
        }
        
        const customerEmail = typeof customer !== 'string' ? customer.email : null
        
        if (!customerEmail) {
          logStep('ERROR: No customer email found', { customerId: subscription.customer })
          return new Response('No customer email', { status: 400 })
        }

        logStep('Customer email found', { email: customerEmail })

        // Find user by email
        const { data: user, error: userError } = await supabase.auth.admin.getUserByEmail(customerEmail)
        if (userError || !user) {
          logStep('ERROR: User not found', { error: userError, email: customerEmail })
          return new Response('User not found', { status: 404 })
        }

        logStep('User found', { userId: user.user.id })

        // Determine subscription tier based on price - corrigido para detectar VIP
        const priceId = subscription.items.data[0]?.price.id
        let tier = tierMapping[priceId] || 'Premium' // Default to Premium for unknown prices
        
        logStep('Determined subscription tier', { priceId, tier })

        // Update or create subscription record - corrigido para usar tabela subscribers
        const subscriptionData = {
          user_id: user.user.id,
          email: customerEmail,
          stripe_customer_id: subscription.customer as string,
          subscribed: true,
          subscription_tier: tier,
          subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString()
        }

        const { error: upsertError } = await supabase
          .from('subscribers')
          .upsert(subscriptionData, { 
            onConflict: 'email',
            ignoreDuplicates: false 
          })

        if (upsertError) {
          logStep('ERROR: Database upsert failed', { error: upsertError, userId: user.user.id })
          return new Response('Database error', { status: 500 })
        }

        // Também atualizar a tabela profiles
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.user.id,
            email: customerEmail,
            assinaturaId: subscription.id,
            updated_at: new Date().toISOString()
          })

        if (profileError) {
          logStep('ERROR: Profile update failed', { error: profileError, userId: user.user.id })
        }

        logStep('Subscription updated successfully', { userId: user.user.id, tier, status: subscription.status })
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        logStep('Processing subscription deletion', { subscriptionId: subscription.id })
        
        // Update subscription status to canceled - corrigido para usar tabela subscribers
        const { error: updateError } = await supabase
          .from('subscribers')
          .update({ 
            subscribed: false,
            subscription_tier: null,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', subscription.customer as string)

        if (updateError) {
          logStep('ERROR: Failed to update subscription status', { error: updateError, subscriptionId: subscription.id })
          return new Response('Database error', { status: 500 })
        }

        logStep('Subscription canceled successfully', { subscriptionId: subscription.id })
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        logStep('Processing successful payment', { invoiceId: invoice.id, subscriptionId: invoice.subscription })
        
        if (invoice.subscription) {
          // Extend subscription period
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
          
          const { error: updateError } = await supabase
            .from('subscribers')
            .update({ 
              subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
              subscribed: true,
              updated_at: new Date().toISOString()
            })
            .eq('stripe_customer_id', subscription.customer as string)

          if (updateError) {
            logStep('ERROR: Failed to update subscription after payment', { error: updateError, subscriptionId: subscription.id })
            return new Response('Database error', { status: 500 })
          }

          logStep('Subscription renewed successfully', { subscriptionId: subscription.id })
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        logStep('Processing failed payment', { invoiceId: invoice.id, subscriptionId: invoice.subscription })
        
        if (invoice.subscription) {
          const { error: updateError } = await supabase
            .from('subscribers')
            .update({ 
              subscribed: false,
              updated_at: new Date().toISOString()
            })
            .eq('stripe_customer_id', invoice.subscription as string)

          if (updateError) {
            logStep('ERROR: Failed to update subscription after payment failure', { error: updateError, subscriptionId: invoice.subscription })
            return new Response('Database error', { status: 500 })
          }

          logStep('Subscription marked as past_due', { subscriptionId: invoice.subscription })
        }
        break
      }

      default:
        logStep('Unhandled event type', { type: event.type })
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    logStep('ERROR: Webhook processing failed', { error: error instanceof Error ? error.message : 'Unknown error' })
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
