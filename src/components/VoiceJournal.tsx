import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { useBrowserSpeechToText } from '@/hooks/useBrowserSpeechToText';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface VoiceJournalProps {
  onSave: (entry: { text: string; audioUrl: string | null; timestamp: string; mood: null }) => Promise<void> | void;
}

type View = 'record' | 'review';

const VoiceJournal = ({ onSave }: VoiceJournalProps) => {
  const [view, setView] = useState<View>('record');
  const [transcription, setTranscription] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const { toast } = useToast();
  
  const { isPremium } = useAuth();
  const {
    isRecording,
    startRecording,
    stopRecording,
    recordingTime,
    audioUrl,
    resetRecording,
    error: recorderError,
    recordingBlob // Correctly reference the blob property
  } = useVoiceRecorder();
  
  const {
    startTranscription: startBrowserTranscription,
    transcription: browserTranscription,
    resetTranscription: resetBrowserTranscription,
    error: browserTranscriptionError,
    isTranscribing: isBrowserTranscribing,
    isSupported: browserTranscriptionSupported,
  } = useBrowserSpeechToText();
  
  useEffect(() => {
    if (browserTranscriptionError) {
      toast({
        title: "Speech Recognition Error",
        description: browserTranscriptionError,
        variant: "destructive"
      });
    }
  }, [browserTranscriptionError, toast]);
  
  useEffect(() => {
    if (browserTranscription) {
      setTranscription(browserTranscription);
    }
  }, [browserTranscription]);
  
  const handleStartRecording = async () => {
    setView('record');
    setTranscription(null);
    resetBrowserTranscription();
    await startRecording();
  };
  
  const handleStopRecording = async () => {
    const blob = await stopRecording();
    if (!blob) return; // Add a check for blob existence
    
    setView('review');
    
    try {
      if (isPremium) {
        // Premium users: use server-side transcription
        setIsTranscribing(true);
        
        // Upload audio to server for transcription
        const formData = new FormData();
        formData.append('audio', recordingBlob as Blob, 'recording.webm');
        
        const { data, error } = await supabase.functions.invoke('transcribe-audio', {
          body: formData,
        });
        
        if (error) throw error;
        
        if (data?.text) {
          setTranscription(data.text);
        } else {
          throw new Error('No transcription returned from server');
        }
      } else {
        // Free users: use browser-based transcription
        if (browserTranscriptionSupported) {
          startBrowserTranscription();
        } else {
          toast({
            title: "Transcription Unavailable",
            description: "Browser transcription is not supported. Upgrade to premium for advanced transcription.",
            variant: "default" // Changed from "warning" to "default"
          });
        }
      }
    } catch (err) {
      console.error('Transcription error:', err);
      toast({
        title: "Transcription Failed",
        description: "There was a problem transcribing your audio. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsTranscribing(false);
    }
  };
  
  const handleRetryTranscription = () => {
    setTranscription(null);
    
    if (isPremium) {
      handleStopRecording(); // Re-trigger server-side transcription
    } else {
      if (browserTranscriptionSupported) {
        startBrowserTranscription(); // Re-trigger browser transcription
      } else {
        toast({
          title: "Transcription Unavailable",
          description: "Browser transcription is not supported. Upgrade to premium for advanced transcription.",
          variant: "default"
        });
      }
    }
  };
  
  const handleSave = () => {
    if (onSave) {
      // Fix the issue with void being tested for truthiness
      const saveResult = onSave({
        text: transcription || '',
        audioUrl,
        timestamp: new Date().toISOString(),
        mood: null
      });
      
      // Process the save result if needed
      if (saveResult instanceof Promise) {
        saveResult.then(() => {
          resetTranscription();
          resetRecording();
          setView('record');
        }).catch((err) => {
          console.error('Error saving journal entry:', err);
        });
      } else {
        // If not a promise, just reset
        resetTranscription();
        resetRecording();
        setView('record');
      }
    }
  };
  
  const resetTranscription = () => {
    setTranscription(null);
    resetBrowserTranscription();
  };
  
  return (
    <Card className="glass-morphism mood-journal-card">
      <CardHeader>
        <CardTitle>Voice Journal</CardTitle>
        <CardDescription>Record your thoughts and feelings.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {view === 'record' && (
          <div className="space-y-4">
            <div className="flex justify-center">
              {isRecording ? (
                <Button variant="destructive" onClick={handleStopRecording} disabled={isTranscribing}>
                  Stop Recording ({recordingTime}s)
                </Button>
              ) : (
                <Button onClick={handleStartRecording} disabled={isTranscribing}>
                  Start Recording
                </Button>
              )}
            </div>
            {recorderError && <p className="text-red-500">{recorderError.message}</p>}
          </div>
        )}
        
        {view === 'review' && (
          <div className="space-y-4">
            {isTranscribing ? (
              <div className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Transcribing...
              </div>
            ) : (
              <>
                <Textarea
                  placeholder="Your transcription will appear here..."
                  value={transcription || ''}
                  onChange={(e) => setTranscription(e.target.value)}
                />
                <div className="flex justify-between">
                  <Button variant="secondary" onClick={handleRetryTranscription}>
                    Retry Transcription
                  </Button>
                  <Button onClick={handleSave} disabled={!transcription}>
                    Save
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VoiceJournal;
