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
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface RequestData {
  userId: string;
  timeframe: string;
  startDate: string;
  endDate: string;
}

serve(async (req) => {
  console.log('Function invoked, method:', req.method);
  
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
    const { userId, timeframe, startDate, endDate } = reqData as RequestData;
    
    console.log(`Processing report request for user ${userId}, timeframe: ${timeframe}, date range: ${startDate} to ${endDate}`);

    // Validate the request
    if (!userId || !timeframe || !startDate || !endDate) {
      console.error('Missing required fields:', { userId, timeframe, startDate, endDate });
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return new Response(
        JSON.stringify({ error: 'Invalid date format' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (start > end) {
      return new Response(
        JSON.stringify({ error: 'Start date must be before end date' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for rate limiting
    const { data: recentReports } = await supabase
      .from('ai_reports')
      .select('created_at')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (recentReports && recentReports.length >= 5) {
      return new Response(
        JSON.stringify({ error: 'Too many report requests. Please wait 24 hours before generating another report.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for cached report
    const { data: cachedReport } = await supabase
      .from('ai_reports')
      .select('*')
      .eq('user_id', userId)
      .eq('timeframe', timeframe)
      .eq('start_date', startDate)
      .eq('end_date', endDate)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .single();

    if (cachedReport) {
      return new Response(
        JSON.stringify({ report: cachedReport }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if the user has premium
    try {
      console.log('Checking premium status for user:', userId);
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('is_premium, premium_expires_at')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return new Response(
          JSON.stringify({ error: 'Error fetching user profile', details: profileError.message }), 
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!userProfile) {
        console.error('User profile not found for ID:', userId);
        return new Response(
          JSON.stringify({ error: 'User profile not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('User profile:', userProfile);
      
      const isPremium = userProfile.is_premium && 
        (!userProfile.premium_expires_at || new Date(userProfile.premium_expires_at) > new Date());

      if (!isPremium) {
        console.log(`User ${userId} does not have premium access`);
        return new Response(
          JSON.stringify({ error: 'Premium subscription required' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log('User has premium access, proceeding to fetch journal entries');
    } catch (err) {
      console.error('Error checking premium status:', err);
      return new Response(
        JSON.stringify({ error: 'Error checking premium status', details: err.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch user's journal entries for the specified timeframe
    try {
      console.log(`Fetching journal entries from ${startDate} to ${endDate}`);
      
      const BATCH_SIZE = 100;
      let allEntries = [];
      let hasMore = true;
      let lastTimestamp = endDate;

      while (hasMore) {
        const { data: batch, error: batchError } = await supabase
          .from('journal_entries')
          .select('id, text, timestamp, mood')  // Select only needed fields
          .eq('user_id', userId)
          .gte('timestamp', startDate)
          .lte('timestamp', lastTimestamp)
          .order('timestamp', { ascending: false })
          .limit(BATCH_SIZE);

        if (batchError) {
          console.error('Error fetching journal entries batch:', batchError);
          return new Response(
            JSON.stringify({ error: 'Error fetching journal entries', details: batchError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (!batch || batch.length === 0) break;

        allEntries = [...allEntries, ...batch];
        if (batch.length < BATCH_SIZE) break;

        lastTimestamp = batch[batch.length - 1].timestamp;
      }

      console.log(`Found ${allEntries.length} entries for analysis`);

      // If there are no entries, return an appropriate message
      if (allEntries.length === 0) {
        return new Response(
          JSON.stringify({ error: 'No journal entries found for the selected timeframe' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate a comprehensive AI report based on the entries
      const moodCounts: Record<string, number> = {};
      let totalWords = 0;
      let longestEntry = 0;
      let totalCharacters = 0;
      let commonWords: Record<string, number> = {};
      let commonWordsList: {word: string, count: number}[] = [];
      const stopWords = ["the", "is", "in", "and", "to", "of", "a", "i", "that", "it", "for", "on", "with", "as", "this", "at"];
      
      allEntries.forEach(entry => {
        // Analyze mood patterns
        const mood = entry.mood || 'unknown';
        moodCounts[mood] = (moodCounts[mood] || 0) + 1;
        
        // Analyze writing patterns
        const words = entry.text ? entry.text.split(/\s+/).filter(word => word.length > 0) : [];
        const wordCount = words.length;
        totalWords += wordCount;
        longestEntry = Math.max(longestEntry, wordCount);
        totalCharacters += entry.text ? entry.text.length : 0;
        
        // Analyze common words (excluding stop words)
        if (entry.text) {
          words.forEach(word => {
            const cleanWord = word.toLowerCase().replace(/[^\w\s]|_/g, "");
            if (cleanWord.length > 3 && !stopWords.includes(cleanWord)) {
              commonWords[cleanWord] = (commonWords[cleanWord] || 0) + 1;
            }
          });
        }
      });
      
      // Get most common words
      commonWordsList = Object.entries(commonWords)
        .map(([word, count]) => ({ word, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      const averageWords = Math.round(totalWords / allEntries.length);
      const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';
      const averageCharacters = Math.round(totalCharacters / allEntries.length);
      
      // Create personalized recommendations based on mood patterns
      const recommendations = [];
      
      if (dominantMood === 'stress' || dominantMood === 'sad') {
        recommendations.push("Consider incorporating stress-reduction techniques like deep breathing or meditation into your daily routine.");
        recommendations.push("Try to schedule more activities that bring you joy and relaxation.");
        recommendations.push("If feelings of sadness persist, consider speaking with a mental health professional for additional support.");
      } else if (dominantMood === 'joy' || dominantMood === 'calm') {
        recommendations.push("Continue your current practices that are contributing to your positive mood.");
        recommendations.push("Consider documenting what specific activities correlate with your positive emotions.");
        recommendations.push("Share activities that bring you joy with others who might benefit from them.");
      } else {
        recommendations.push("Try to identify patterns in activities that trigger different emotional responses.");
        recommendations.push("Consider incorporating mindfulness practices to increase emotional awareness.");
        recommendations.push("Set aside regular time for self-reflection to better understand your emotional patterns.");
      }
      
      recommendations.push("Journal consistently to better track your mood patterns over time.");
      
      // Create a simple analysis
      const analysis = {
        summary: `Based on your ${allEntries.length} journal entries from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}, your dominant mood was "${dominantMood}".`,
        insights: [
          `You journaled ${allEntries.length} times during this period.`,
          `Your entries contained an average of ${averageWords} words (${averageCharacters} characters).`,
          `Your longest entry contained ${longestEntry} words.`,
          `Your mood distribution was: ${Object.entries(moodCounts).map(([mood, count]) => `${mood}: ${count} entries (${Math.round(count/allEntries.length*100)}%)`).join(', ')}.`,
          `Common themes in your writing included: ${commonWordsList.length > 0 ? commonWordsList.map(item => `"${item.word}" (${item.count} times)`).join(', ') : "No common themes identified."}`
        ],
        recommendations: recommendations
      };
      
      // Generate the content for the report
      const content = `
# MoodMemo AI Insights Report
## ${timeframe}

${analysis.summary}

### Key Insights
${analysis.insights.map(insight => `- ${insight}`).join('\n')}

### Mood Patterns
Your dominant mood during this period was "${dominantMood}" (${Math.round(moodCounts[dominantMood]/allEntries.length*100)}% of entries).

${Object.entries(moodCounts)
  .sort((a, b) => b[1] - a[1])
  .map(([mood, count]) => `- ${mood}: ${count} entries (${Math.round(count/allEntries.length*100)}%)`)
  .join('\n')}

### Writing Patterns
- Average entry length: ${averageWords} words
- Longest entry: ${longestEntry} words
- Journal frequency: ${Math.round(allEntries.length / ((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)))} entries per day

### Recommendations
${recommendations.map(rec => `- ${rec}`).join('\n')}

*This report was generated based on your journal entries from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}.*
`;

      console.log('Report content generated, saving to database');

      // Save the report to the database
      try {
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
            JSON.stringify({ error: 'Error saving AI report', details: reportError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('Report saved successfully with ID:', report.id);

        return new Response(
          JSON.stringify({ report }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (err) {
        console.error('Error saving report:', err);
        return new Response(
          JSON.stringify({ error: 'Error saving report', details: err.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (err) {
      console.error('Error processing journal entries:', err);
      return new Response(
        JSON.stringify({ error: 'Error processing journal entries', details: err.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in generate-ai-report function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
