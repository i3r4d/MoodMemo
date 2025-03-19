
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.46.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the last week of journal entries
    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { data: entries, error } = await supabase
      .from('journal_entries')
      .select('mood, timestamp')
      .eq('user_id', userId)
      .gte('timestamp', oneWeekAgo.toISOString())
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Error fetching journal entries:', error);
      throw new Error('Error fetching journal entries');
    }

    // Group entries by day of week
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const moodCounts: Record<string, Record<string, number>> = {};
    
    // Initialize mood counts for each day
    daysOfWeek.forEach(day => {
      moodCounts[day] = {
        joy: 0,
        calm: 0,
        neutral: 0,
        sad: 0,
        stress: 0
      };
    });
    
    // Count moods by day
    entries.forEach((entry) => {
      if (entry.mood && entry.timestamp) {
        const date = new Date(entry.timestamp);
        const day = daysOfWeek[date.getDay()];
        moodCounts[day][entry.mood as string] = (moodCounts[day][entry.mood as string] || 0) + 1;
      }
    });
    
    // Format data for frontend
    const weeklyData = Object.entries(moodCounts).map(([day, moods]) => ({
      day,
      ...moods
    }));
    
    // Reorder to start with Monday
    const orderedDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const orderedWeeklyData = orderedDays.map(day => 
      weeklyData.find(data => data.day === day) || { 
        day, 
        joy: 0, 
        calm: 0, 
        neutral: 0, 
        sad: 0, 
        stress: 0 
      }
    );

    return new Response(
      JSON.stringify({ weeklyData: orderedWeeklyData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in get-mood-stats function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
