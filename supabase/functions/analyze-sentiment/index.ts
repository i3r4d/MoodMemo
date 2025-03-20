import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.2.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SentimentAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
  emotions: string[];
  suggestions: string[];
  summary: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize OpenAI client
    const configuration = new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });
    const openai = new OpenAIApi(configuration);

    // Analyze sentiment and emotions
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert in emotional intelligence and sentiment analysis. 
          Analyze the following text and provide:
          1. Overall sentiment (positive, neutral, or negative)
          2. Confidence score (0-1)
          3. List of primary emotions detected
          4. Personalized suggestions for emotional well-being
          5. Brief summary of the emotional content
          
          Format the response as a JSON object with these keys: sentiment, confidence, emotions, suggestions, summary`
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const analysis = JSON.parse(completion.data.choices[0].message?.content || '{}') as SentimentAnalysis;

    // Store the analysis in the database
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: dbError } = await supabaseClient
      .from('sentiment_analysis')
      .insert([
        {
          text,
          sentiment: analysis.sentiment,
          confidence: analysis.confidence,
          emotions: analysis.emotions,
          suggestions: analysis.suggestions,
          summary: analysis.summary,
          created_at: new Date().toISOString(),
        }
      ]);

    if (dbError) {
      console.error('Error storing sentiment analysis:', dbError);
      throw dbError;
    }

    return new Response(
      JSON.stringify(analysis),
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