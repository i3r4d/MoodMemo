
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@12.4.0?target=deno"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, priceId, amount } = await req.json()
    
    if (!userId || !amount) {
      throw new Error('User ID and amount are required')
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    // Get user's email from profiles
    const { data: userData, error: userError } = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/profiles?id=eq.${userId}&select=email`, {
      headers: {
        'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
    }).then(res => res.json());

    if (userError || !userData || userData.length === 0) {
      throw new Error('Failed to get user information')
    }

    // Get or create Stripe customer
    let customerId: string
    const existingCustomers = await stripe.customers.list({
      email: userData[0].email,
      limit: 1,
    })

    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id
    } else {
      const newCustomer = await stripe.customers.create({
        email: userData[0].email,
        metadata: {
          supabase_id: userId,
        },
      })
      customerId = newCustomer.id
    }

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      customer: customerId,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        supabase_id: userId,
        price_id: priceId,
      },
    })

    return new Response(
      JSON.stringify({ 
        clientSecret: paymentIntent.client_secret,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Payment intent creation error:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
