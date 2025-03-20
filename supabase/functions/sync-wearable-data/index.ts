import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HealthMetric {
  timestamp: string;
  metric_type: string;
  value: number;
  unit?: string;
  source?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { device_type, access_token, refresh_token, user_id } = await req.json();

    if (!device_type || !access_token || !user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Store or update device connection
    const { error: connectionError } = await supabaseClient
      .from('device_connections')
      .upsert({
        user_id,
        device_type,
        access_token,
        refresh_token,
        token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString(), // 1 hour expiry
        last_sync_at: new Date().toISOString(),
      });

    if (connectionError) throw connectionError;

    // Fetch health metrics based on device type
    let metrics: HealthMetric[] = [];
    switch (device_type) {
      case 'fitbit':
        metrics = await fetchFitbitData(access_token);
        break;
      case 'apple_watch':
        metrics = await fetchAppleWatchData(access_token);
        break;
      case 'garmin':
        metrics = await fetchGarminData(access_token);
        break;
      default:
        throw new Error('Unsupported device type');
    }

    // Store health metrics
    if (metrics.length > 0) {
      const { error: metricsError } = await supabaseClient
        .from('health_metrics')
        .insert(
          metrics.map(metric => ({
            user_id,
            device_type,
            ...metric,
          }))
        );

      if (metricsError) throw metricsError;
    }

    return new Response(
      JSON.stringify({ success: true, metrics_synced: metrics.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function fetchFitbitData(accessToken: string): Promise<HealthMetric[]> {
  const baseUrl = 'https://api.fitbit.com/1/user/-';
  const metrics: HealthMetric[] = [];

  try {
    // Fetch heart rate data
    const heartRateResponse = await fetch(`${baseUrl}/activities/heart/date/today/1d.json`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const heartRateData = await heartRateResponse.json();
    
    if (heartRateData['activities-heart']) {
      heartRateData['activities-heart'].forEach((point: any) => {
        metrics.push({
          timestamp: point.time,
          metric_type: 'heart_rate',
          value: point.value,
          unit: 'bpm',
          source: 'fitbit'
        });
      });
    }

    // Fetch sleep data
    const sleepResponse = await fetch(`${baseUrl}/sleep/date/today.json`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const sleepData = await sleepResponse.json();
    
    if (sleepData.sleep) {
      sleepData.sleep.forEach((sleep: any) => {
        metrics.push({
          timestamp: sleep.startTime,
          metric_type: 'sleep_duration',
          value: sleep.duration / 1000 / 60, // Convert to minutes
          unit: 'minutes',
          source: 'fitbit'
        });
      });
    }

    // Fetch activity data
    const activityResponse = await fetch(`${baseUrl}/activities/date/today.json`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const activityData = await activityResponse.json();
    
    if (activityData.summary) {
      metrics.push({
        timestamp: new Date().toISOString(),
        metric_type: 'steps',
        value: activityData.summary.steps,
        unit: 'count',
        source: 'fitbit'
      });
    }
  } catch (error) {
    console.error('Error fetching Fitbit data:', error);
  }

  return metrics;
}

async function fetchAppleWatchData(accessToken: string): Promise<HealthMetric[]> {
  // Apple HealthKit integration would go here
  // This requires additional setup with Apple's HealthKit framework
  return [];
}

async function fetchGarminData(accessToken: string): Promise<HealthMetric[]> {
  // Garmin Connect API integration would go here
  return [];
} 