
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseVoiceTranscriptionProps {
  onTranscriptionComplete?: (text: string) => void;
}

export const useVoiceTranscription = ({ onTranscriptionComplete }: UseVoiceTranscriptionProps = {}) => {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionText, setTranscriptionText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { user, isPremium } = useAuth();
  const { toast } = useToast();

  // Reset error when starting a new transcription
  useEffect(() => {
    if (isTranscribing) {
      setError(null);
    }
  }, [isTranscribing]);

  // Process audio with premium transcription service
  const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
    if (!user) {
      throw new Error('User must be logged in');
    }

    if (!isPremium) {
      throw new Error('Premium account required for server-based transcription');
    }

    setIsTranscribing(true);
    
    try {
      // Convert blob to base64
      const reader = new FileReader();
      
      // Create a promise that resolves when FileReader completes
      const base64Data = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1]; // Remove data URL prefix
          resolve(base64);
        };
        reader.onerror = () => {
          reject(new Error('Failed to read audio file'));
        };
        reader.readAsDataURL(audioBlob);
      });
      
      // Send to our edge function
      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: { 
          audio: base64Data,
          userId: user.id
        },
      });

      if (error) {
        throw new Error(error.message || 'Transcription failed');
      }

      if (!data.text) {
        throw new Error('No transcription returned');
      }

      setTranscriptionText(data.text);
      
      if (onTranscriptionComplete) {
        onTranscriptionComplete(data.text);
      }
      
      return data.text;
    } catch (err: any) {
      console.error('Transcription error:', err);
      setError(err.message || 'Error transcribing audio');
      toast({
        title: 'Transcription Error',
        description: err.message || 'Error transcribing audio',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setIsTranscribing(false);
    }
  };

  return {
    isTranscribing,
    transcriptionText,
    transcribeAudio,
    error,
  };
};
