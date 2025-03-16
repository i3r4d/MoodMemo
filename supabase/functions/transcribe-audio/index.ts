
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Process base64 in chunks to prevent memory issues
function processBase64Chunks(base64String: string, chunkSize = 32768) {
  const chunks: Uint8Array[] = [];
  let position = 0;
  
  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);
    
    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }
    
    chunks.push(bytes);
    position += chunkSize;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { audio, userId } = await req.json()
    
    if (!audio) {
      throw new Error('No audio data provided')
    }

    if (!userId) {
      throw new Error('User ID is required')
    }

    // Check if user is premium
    const { data: userData, error: userError } = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/profiles?id=eq.${userId}&select=is_premium,premium_expires_at`, {
      headers: {
        'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
    }).then(res => res.json());

    if (userError || !userData || userData.length === 0) {
      throw new Error('Failed to verify premium status')
    }

    const profile = userData[0];
    const isPremium = profile.is_premium && 
      (!profile.premium_expires_at || new Date(profile.premium_expires_at) > new Date());

    if (!isPremium) {
      throw new Error('Premium subscription required for advanced transcription')
    }

    // Process audio in chunks
    const binaryAudio = processBase64Chunks(audio)
    
    // Prepare form data for OpenAI API
    const formData = new FormData()
    const blob = new Blob([binaryAudio], { type: 'audio/webm' })
    formData.append('file', blob, 'audio.webm')
    formData.append('model', 'whisper-1')

    // Send to OpenAI for transcription
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: formData,
    })

    if (!response.ok) {
      console.error('OpenAI API error:', await response.text());
      throw new Error('Transcription service unavailable')
    }

    const result = await response.json()
    console.log('Transcription successful:', result.text.substring(0, 50) + '...');

    return new Response(
      JSON.stringify({ text: result.text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Transcription error:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
