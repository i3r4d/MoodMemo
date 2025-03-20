import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { SpeechClient } from 'https://esm.sh/@google-cloud/speech@5.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TranscriptionRequest {
  filePath: string;
  language: string;
  options: {
    model?: 'default' | 'enhanced';
    punctuate?: boolean;
    profanityFilter?: boolean;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { filePath, language, options } = await req.json() as TranscriptionRequest;

    // Download the audio file from Supabase Storage
    const { data: audioData, error: downloadError } = await supabaseClient.storage
      .from('audio')
      .download(filePath);

    if (downloadError) throw downloadError;

    // Initialize Google Cloud Speech-to-Text client
    const speechClient = new SpeechClient({
      credentials: JSON.parse(Deno.env.get('GOOGLE_CLOUD_CREDENTIALS') ?? '{}'),
    });

    // Configure the transcription request
    const audio = {
      content: audioData.toString('base64'),
    };

    const config = {
      encoding: 'WEBM_OPUS',
      sampleRateHertz: 48000,
      languageCode: language,
      model: options.model === 'enhanced' ? 'video' : 'default',
      enableAutomaticPunctuation: options.punctuate,
      profanityFilter: options.profanityFilter,
      enableWordTimeOffsets: true,
    };

    // Perform the transcription
    const [response] = await speechClient.recognize({
      audio,
      config,
    });

    const transcription = response.results?.[0]?.alternatives?.[0];
    if (!transcription) {
      throw new Error('No transcription results');
    }

    // Process word-level timing information
    const words = transcription.words?.map(word => ({
      word: word.word || '',
      start: word.startTime?.seconds || 0,
      end: word.endTime?.seconds || 0,
      confidence: word.confidence || 0,
    })) || [];

    // Return the transcription result
    return new Response(
      JSON.stringify({
        text: transcription.transcript || '',
        confidence: transcription.confidence || 0,
        language,
        duration: words[words.length - 1]?.end || 0,
        words,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
