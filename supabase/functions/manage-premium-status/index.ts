
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    const { action, userId, adminId, duration } = await req.json()
    
    if (!action || !userId || !adminId) {
      throw new Error('Action, user ID, and admin ID are required')
    }

    // Verify admin status
    const { data: adminData, error: adminError } = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/profiles?id=eq.${adminId}&select=is_admin`, {
      headers: {
        'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
    }).then(res => res.json());

    if (adminError || !adminData || adminData.length === 0 || !adminData[0].is_admin) {
      throw new Error('Unauthorized: Admin privileges required')
    }

    if (action === 'grant') {
      // Calculate expiration date
      let premiumExpiresAt = null;
      if (duration) {
        premiumExpiresAt = new Date();
        premiumExpiresAt.setDate(premiumExpiresAt.getDate() + duration);
      }

      // Update user profile to grant premium
      await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/profiles?id=eq.${userId}`, {
        method: 'PATCH',
        headers: {
          'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          is_premium: true,
          premium_expires_at: premiumExpiresAt ? premiumExpiresAt.toISOString() : null,
        }),
      })

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Premium status granted to user ${userId}`,
          expiresAt: premiumExpiresAt,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } 
    else if (action === 'revoke') {
      // Update user profile to revoke premium
      await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/profiles?id=eq.${userId}`, {
        method: 'PATCH',
        headers: {
          'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          is_premium: false,
          premium_expires_at: null,
        }),
      })

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Premium status revoked from user ${userId}`,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    throw new Error('Invalid action. Use "grant" or "revoke".')

  } catch (error) {
    console.error('Premium management error:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
