import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.46.0";
import { corsHeaders } from '../_shared/cors.ts';

const ALLOWED_ORIGINS = [
  'https://mood-memo-journey.lovable.app',
  'https://preview--mood-memo-journey.lovable.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

// Create a Supabase client with the Deno env variables
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface RequestData {
  userId: string;
  timeframe: string;
  startDate: string;
  endDate: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the origin from the request headers
    const origin = req.headers.get('origin') || '';
    
    // Check if the origin is allowed
    if (!ALLOWED_ORIGINS.includes(origin)) {
      return new Response(
        JSON.stringify({ error: 'Not allowed' }),
        { 
          status: 403,
          headers: {
            ...corsHeaders,
            'Access-Control-Allow-Origin': origin
          }
        }
      );
    }

    // Get request data
    const reqData = await req.json();
    const { userId, timeframe, startDate, endDate } = reqData;

    // Validate required fields
    if (!userId || !timeframe || !startDate || !endDate) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400,
          headers: {
            ...corsHeaders,
            'Access-Control-Allow-Origin': origin
          }
        }
      );
    }

    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return new Response(
        JSON.stringify({ error: 'Invalid date format' }),
        { 
          status: 400,
          headers: {
            ...corsHeaders,
            'Access-Control-Allow-Origin': origin
          }
        }
      );
    }

    if (start > end) {
      return new Response(
        JSON.stringify({ error: 'Start date must be before end date' }),
        { 
          status: 400,
          headers: {
            ...corsHeaders,
            'Access-Control-Allow-Origin': origin
          }
        }
      );
    }

    // Check for cached report
    const { data: cachedReport, error: cacheError } = await supabaseClient
      .from('ai_reports')
      .select('*')
      .eq('user_id', userId)
      .eq('timeframe', timeframe)
      .eq('start_date', startDate)
      .eq('end_date', endDate)
      .single();

    if (cacheError && cacheError.code !== 'PGRST116') {
      console.error('Error checking cache:', cacheError);
      throw cacheError;
    }

    if (cachedReport) {
      return new Response(
        JSON.stringify(cachedReport),
        { 
          headers: {
            ...corsHeaders,
            'Access-Control-Allow-Origin': origin
          }
        }
      );
    }

    // Get journal entries
    const { data: entries, error: entriesError } = await supabaseClient
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', startDate)
      .lte('timestamp', endDate)
      .order('timestamp', { ascending: true });

    if (entriesError) {
      console.error('Error fetching entries:', entriesError);
      throw entriesError;
    }

    if (!entries || entries.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No entries found for the specified date range' }),
        { 
          status: 404,
          headers: {
            ...corsHeaders,
            'Access-Control-Allow-Origin': origin
          }
        }
      );
    }

    // Generate report
    const report = {
      user_id: userId,
      timeframe,
      start_date: startDate,
      end_date: endDate,
      total_entries: entries.length,
      average_mood: entries.reduce((acc, entry) => acc + entry.mood, 0) / entries.length,
      mood_distribution: entries.reduce((acc, entry) => {
        acc[entry.mood] = (acc[entry.mood] || 0) + 1;
        return acc;
      }, {}),
      generated_at: new Date().toISOString(),
    };

    // Save report to database
    const { error: saveError } = await supabaseClient
      .from('ai_reports')
      .insert([report]);

    if (saveError) {
      console.error('Error saving report:', saveError);
      throw saveError;
    }

    return new Response(
      JSON.stringify(report),
      { 
        headers: {
          ...corsHeaders,
          'Access-Control-Allow-Origin': origin
        }
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Access-Control-Allow-Origin': req.headers.get('origin') || '*'
        }
      }
    );
  }
});
