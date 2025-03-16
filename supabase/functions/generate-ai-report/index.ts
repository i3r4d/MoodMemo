
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.46.0";

// Define the CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a Supabase client with the Deno env variables
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface RequestData {
  userId: string;
  timeframe: string;
  startDate: string;
  endDate: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request data
    const { userId, timeframe, startDate, endDate } = await req.json() as RequestData;

    // Validate the request
    if (!userId || !timeframe || !startDate || !endDate) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if the user has premium
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('is_premium, premium_expires_at')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Error fetching user profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isPremium = userProfile.is_premium && 
      (!userProfile.premium_expires_at || new Date(userProfile.premium_expires_at) > new Date());

    if (!isPremium) {
      return new Response(
        JSON.stringify({ error: 'Premium subscription required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch user's journal entries for the specified timeframe
    const { data: entries, error: entriesError } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', startDate)
      .lte('timestamp', endDate)
      .order('timestamp', { ascending: false });

    if (entriesError) {
      console.error('Error fetching journal entries:', entriesError);
      return new Response(
        JSON.stringify({ error: 'Error fetching journal entries' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If there are no entries, return an appropriate message
    if (!entries || entries.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No journal entries found for the selected timeframe' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate a simple AI report based on the entries
    // In a real implementation, this would call an AI service like OpenAI
    const moodCounts: Record<string, number> = {};
    let totalWords = 0;
    let longestEntry = 0;
    
    entries.forEach(entry => {
      const mood = entry.mood || 'unknown';
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
      
      const wordCount = entry.text.split(/\s+/).length;
      totalWords += wordCount;
      longestEntry = Math.max(longestEntry, wordCount);
    });
    
    const averageWords = Math.round(totalWords / entries.length);
    const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0][0];
    
    // Create a simple analysis
    const analysis = {
      summary: `Based on your ${entries.length} journal entries from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}, your dominant mood was "${dominantMood}".`,
      insights: [
        `You journaled ${entries.length} times during this period.`,
        `Your entries contained an average of ${averageWords} words.`,
        `Your longest entry contained ${longestEntry} words.`,
        `Your mood distribution was: ${Object.entries(moodCounts).map(([mood, count]) => `${mood}: ${count}`).join(', ')}.`,
      ],
      recommendations: [
        dominantMood === 'joy' || dominantMood === 'calm' 
          ? "Continue your current practices that are contributing to your positive mood."
          : "Consider incorporating mood-boosting activities like exercise or mindfulness into your routine.",
        "Try to journal consistently to better track your mood patterns.",
        "Explore guided journaling prompts to deepen your self-reflection practice.",
      ]
    };
    
    // Generate the content for the report
    const content = `
# MoodMemo AI Insights Report
## ${timeframe}

${analysis.summary}

### Key Insights
${analysis.insights.map(insight => `- ${insight}`).join('\n')}

### Mood Patterns
Your dominant mood during this period was "${dominantMood}".

### Recommendations
${analysis.recommendations.map(rec => `- ${rec}`).join('\n')}

*This report was generated based on your journal entries from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}.*
`;

    // Save the report to the database
    const { data: report, error: reportError } = await supabase
      .from('ai_reports')
      .insert({
        user_id: userId,
        timeframe,
        content,
        start_date: startDate,
        end_date: endDate,
      })
      .select()
      .single();

    if (reportError) {
      console.error('Error saving AI report:', reportError);
      return new Response(
        JSON.stringify({ error: 'Error saving AI report' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ report }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-ai-report function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
