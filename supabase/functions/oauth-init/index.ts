import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { provider, scopes } = await req.json();

    // Get the current user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Invalid user');
    }

    // Generate OAuth URL based on provider
    let oauthUrl: string;
    const state = crypto.randomUUID();

    switch (provider) {
      case 'google_calendar':
        oauthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        oauthUrl.searchParams.append('client_id', Deno.env.get('GOOGLE_CLIENT_ID') ?? '');
        oauthUrl.searchParams.append('redirect_uri', `${Deno.env.get('APP_URL')}/oauth/callback`);
        oauthUrl.searchParams.append('response_type', 'code');
        oauthUrl.searchParams.append('scope', scopes.join(' '));
        oauthUrl.searchParams.append('state', state);
        oauthUrl.searchParams.append('access_type', 'offline');
        oauthUrl.searchParams.append('prompt', 'consent');
        break;

      case 'todoist':
        oauthUrl = new URL('https://todoist.com/oauth/authorize');
        oauthUrl.searchParams.append('client_id', Deno.env.get('TODOIST_CLIENT_ID') ?? '');
        oauthUrl.searchParams.append('redirect_uri', `${Deno.env.get('APP_URL')}/oauth/callback`);
        oauthUrl.searchParams.append('scope', scopes.join(','));
        oauthUrl.searchParams.append('state', state);
        break;

      case 'apple_health':
        oauthUrl = new URL('https://health.apple.com/oauth/authorize');
        oauthUrl.searchParams.append('client_id', Deno.env.get('APPLE_HEALTH_CLIENT_ID') ?? '');
        oauthUrl.searchParams.append('redirect_uri', `${Deno.env.get('APP_URL')}/oauth/callback`);
        oauthUrl.searchParams.append('response_type', 'code');
        oauthUrl.searchParams.append('scope', scopes.join(' '));
        oauthUrl.searchParams.append('state', state);
        break;

      default:
        throw new Error('Unsupported provider');
    }

    // Store state in database for verification
    const { error: stateError } = await supabaseClient
      .from('oauth_states')
      .insert({
        user_id: user.id,
        state,
        provider,
        created_at: new Date().toISOString(),
      });

    if (stateError) {
      throw stateError;
    }

    return new Response(
      JSON.stringify({ url: oauthUrl.toString() }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
}); 