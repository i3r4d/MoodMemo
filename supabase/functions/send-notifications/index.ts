import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get upcoming reminders for all users
    const { data: reminders, error: remindersError } = await supabaseClient
      .rpc('get_upcoming_reminders', { hours_ahead: 1 });

    if (remindersError) throw remindersError;

    // Process each reminder
    for (const reminder of reminders) {
      // Get user's notification preferences
      const { data: preferences, error: preferencesError } = await supabaseClient
        .rpc('get_notification_preferences', { user_id: reminder.user_id });

      if (preferencesError) throw preferencesError;

      // Send push notification if enabled
      if (preferences.push_enabled) {
        const { error: pushError } = await supabaseClient
          .from('push_notifications')
          .insert({
            user_id: reminder.user_id,
            title: reminder.title,
            body: reminder.message,
            data: {
              type: reminder.type,
              reminder_id: reminder.id,
              sound_enabled: reminder.sound_enabled
            }
          });

        if (pushError) throw pushError;
      }

      // Send email notification if enabled
      if (preferences.email_enabled) {
        const { error: emailError } = await supabaseClient
          .from('email_notifications')
          .insert({
            user_id: reminder.user_id,
            subject: `Reminder: ${reminder.title}`,
            body: reminder.message,
            data: {
              type: reminder.type,
              reminder_id: reminder.id
            }
          });

        if (emailError) throw emailError;
      }

      // Mark reminder as triggered
      const { error: updateError } = await supabaseClient
        .rpc('mark_reminder_triggered', { reminder_id: reminder.id });

      if (updateError) throw updateError;
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Notifications processed successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}); 