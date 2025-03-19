
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
    const { text } = await req.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: "Text is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Simple sentiment analysis based on keywords
    const lowerText = text.toLowerCase();
    let mood;
    
    // In a real implementation, this would call an NLP service like HuggingFace, Azure Text Analytics, etc.
    // For now, we'll use a more sophisticated version of the keyword matching
    
    // Score counters for each emotion
    const scores = {
      joy: 0,
      calm: 0,
      neutral: 0,
      sad: 0,
      stress: 0
    };
    
    // Keywords for each emotion
    const joyKeywords = ['happy', 'joy', 'excited', 'great', 'wonderful', 'excellent', 'glad', 'pleasure', 'delighted'];
    const calmKeywords = ['calm', 'peaceful', 'relaxed', 'content', 'serene', 'tranquil', 'composed', 'collected'];
    const sadKeywords = ['sad', 'upset', 'depressed', 'unhappy', 'miserable', 'gloomy', 'disappointed', 'heartbroken'];
    const stressKeywords = ['stress', 'anxious', 'worried', 'afraid', 'scared', 'nervous', 'tense', 'overwhelmed'];
    const neutralKeywords = ['okay', 'fine', 'average', 'neutral', 'alright', 'so-so', 'normal', 'ordinary'];
    
    // Count occurrences of each emotion's keywords
    joyKeywords.forEach(word => {
      if (lowerText.includes(word)) scores.joy += 1;
    });
    
    calmKeywords.forEach(word => {
      if (lowerText.includes(word)) scores.calm += 1;
    });
    
    sadKeywords.forEach(word => {
      if (lowerText.includes(word)) scores.sad += 1;
    });
    
    stressKeywords.forEach(word => {
      if (lowerText.includes(word)) scores.stress += 1;
    });
    
    neutralKeywords.forEach(word => {
      if (lowerText.includes(word)) scores.neutral += 1;
    });
    
    // Determine the dominant emotion
    let maxScore = 0;
    let dominantMood = null;
    
    Object.entries(scores).forEach(([emotion, score]) => {
      if (score > maxScore) {
        maxScore = score;
        dominantMood = emotion;
      }
    });
    
    // If no dominant emotion is found, default to neutral
    mood = dominantMood || 'neutral';

    return new Response(
      JSON.stringify({ mood, scores }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analyze-mood function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
