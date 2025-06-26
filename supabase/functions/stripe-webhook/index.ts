
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

serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      return new Response('Missing stripe-signature header', { status: 400 })
    }

    const body = await req.text()
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    console.log('Webhook event received:', event.type)

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Get customer email to find user
        const customer = await stripe.customers.retrieve(subscription.customer as string)
        const customerEmail = typeof customer !== 'string' ? customer.email : null
        
        if (!customerEmail) {
          console.error('No customer email found')
          return new Response('No customer email', { status: 400 })
        }

        // Find user by email
        const { data: user, error: userError } = await supabase.auth.admin.getUserByEmail(customerEmail)
        if (userError || !user) {
          console.error('User not found:', userError)
          return new Response('User not found', { status: 404 })
        }

        // Determine subscription tier based on price
        const priceId = subscription.items.data[0]?.price.id
        let tier = 'agente_financeiro' // Default tier
        
        // Map price IDs to tiers if you have multiple plans
        // const tierMapping: Record<string, string> = {
        //   'price_xxx': 'basic',
        //   'price_yyy': 'premium'
        // }
        // tier = tierMapping[priceId] || tier

        // Update or create subscription record
        const subscriptionData = {
          user_id: user.user.id,
          subscription_id: subscription.id,
          subscription_tier: tier,
          subscription_status: subscription.status,
          subscription_start: new Date(subscription.current_period_start * 1000).toISOString(),
          subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
          stripe_customer_id: subscription.customer as string,
          stripe_price_id: priceId,
          updated_at: new Date().toISOString()
        }

        const { error: upsertError } = await supabase
          .from('subscriptions')
          .upsert(subscriptionData, { 
            onConflict: 'user_id',
            ignoreDuplicates: false 
          })

        if (upsertError) {
          console.error('Database error:', upsertError)
          return new Response('Database error', { status: 500 })
        }

        console.log('Subscription updated successfully for user:', user.user.id)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Update subscription status to canceled
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({ 
            subscription_status: 'canceled',
            updated_at: new Date().toISOString()
          })
          .eq('subscription_id', subscription.id)

        if (updateError) {
          console.error('Database error:', updateError)
          return new Response('Database error', { status: 500 })
        }

        console.log('Subscription canceled for subscription:', subscription.id)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        
        if (invoice.subscription) {
          // Extend subscription period
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
          
          const { error: updateError } = await supabase
            .from('subscriptions')
            .update({ 
              subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
              subscription_status: subscription.status,
              updated_at: new Date().toISOString()
            })
            .eq('subscription_id', subscription.id)

          if (updateError) {
            console.error('Database error:', updateError)
            return new Response('Database error', { status: 500 })
          }

          console.log('Subscription renewed for subscription:', subscription.id)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        
        if (invoice.subscription) {
          const { error: updateError } = await supabase
            .from('subscriptions')
            .update({ 
              subscription_status: 'past_due',
              updated_at: new Date().toISOString()
            })
            .eq('subscription_id', invoice.subscription as string)

          if (updateError) {
            console.error('Database error:', updateError)
            return new Response('Database error', { status: 500 })
          }

          console.log('Payment failed for subscription:', invoice.subscription)
        }
        break
      }

      default:
        console.log('Unhandled event type:', event.type)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Webhook error:', error)
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
