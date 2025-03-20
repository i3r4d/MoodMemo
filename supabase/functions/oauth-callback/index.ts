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

    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    if (error) {
      throw new Error(`OAuth error: ${error}`);
    }

    if (!code || !state) {
      throw new Error('Missing code or state');
    }

    // Verify state and get provider
    const { data: stateData, error: stateError } = await supabaseClient
      .from('oauth_states')
      .select('*')
      .eq('state', state)
      .single();

    if (stateError || !stateData) {
      throw new Error('Invalid state');
    }

    // Exchange code for tokens
    let tokens;
    switch (stateData.provider) {
      case 'google_calendar':
        tokens = await exchangeGoogleCode(code);
        break;

      case 'todoist':
        tokens = await exchangeTodoistCode(code);
        break;

      case 'apple_health':
        tokens = await exchangeAppleHealthCode(code);
        break;

      default:
        throw new Error('Unsupported provider');
    }

    // Store integration
    const { error: integrationError } = await supabaseClient
      .from('integrations')
      .insert({
        user_id: stateData.user_id,
        provider: stateData.provider,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: tokens.expires_at,
        metadata: tokens.metadata,
      });

    if (integrationError) {
      throw integrationError;
    }

    // Clean up state
    await supabaseClient
      .from('oauth_states')
      .delete()
      .eq('state', state);

    // Redirect back to app
    return Response.redirect(`${Deno.env.get('APP_URL')}/settings/integrations?success=true`);
  } catch (error) {
    return Response.redirect(
      `${Deno.env.get('APP_URL')}/settings/integrations?error=${encodeURIComponent(
        error.message
      )}`
    );
  }
});

async function exchangeGoogleCode(code: string) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: Deno.env.get('GOOGLE_CLIENT_ID') ?? '',
      client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') ?? '',
      redirect_uri: `${Deno.env.get('APP_URL')}/oauth/callback`,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange Google code');
  }

  const data = await response.json();
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
    metadata: {
      token_type: data.token_type,
      scope: data.scope,
    },
  };
}

async function exchangeTodoistCode(code: string) {
  const response = await fetch('https://todoist.com/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: Deno.env.get('TODOIST_CLIENT_ID') ?? '',
      client_secret: Deno.env.get('TODOIST_CLIENT_SECRET') ?? '',
      redirect_uri: `${Deno.env.get('APP_URL')}/oauth/callback`,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange Todoist code');
  }

  const data = await response.json();
  return {
    access_token: data.access_token,
    expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
    metadata: {
      token_type: data.token_type,
      scope: data.scope,
    },
  };
}

async function exchangeAppleHealthCode(code: string) {
  const response = await fetch('https://health.apple.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: Deno.env.get('APPLE_HEALTH_CLIENT_ID') ?? '',
      client_secret: Deno.env.get('APPLE_HEALTH_CLIENT_SECRET') ?? '',
      redirect_uri: `${Deno.env.get('APP_URL')}/oauth/callback`,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange Apple Health code');
  }

  const data = await response.json();
  return {
    access_token: data.access_token,
    expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
    metadata: {
      token_type: data.token_type,
      scope: data.scope,
    },
  };
} 