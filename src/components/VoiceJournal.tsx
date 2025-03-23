
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import useBrowserSpeechToText from '@/hooks/useBrowserSpeechToText';
import { cn } from '@/lib/utils';
import {
  MicIcon,
  StopCircleIcon,
  AudioWaveformIcon,
  PlayIcon,
  PauseIcon,
  FileTextIcon,
  CheckIcon,
  RefreshCwIcon,
} from 'lucide-react';

interface VoiceJournalProps {
  onComplete: (audioUrl: string | null, text: string) => Promise<void>;
  isSubmitting?: boolean;
}

const VoiceJournal: React.FC<VoiceJournalProps> = ({
  onComplete,
  isSubmitting = false,
}) => {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();
  
  const {
    isRecording,
    recordingTime,
    audioUrl,
    recordingBlob,
    startRecording,
    stopRecording,
    resetRecording,
  } = useVoiceRecorder();
  
  const { 
    transcript, 
    isListening, 
    startListening, 
    stopListening 
  } = useBrowserSpeechToText();

  // Monitor transcript changes
  useEffect(() => {
    if (transcript) {
      console.log("Transcript updated:", transcript);
      setTranscribedText(transcript);
    }
  }, [transcript]);

  // Set up audio player controls
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onplay = () => setIsPlaying(true);
      audioRef.current.onpause = () => setIsPlaying(false);
      audioRef.current.onended = () => setIsPlaying(false);
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.onplay = null;
        audioRef.current.onpause = null;
        audioRef.current.onended = null;
      }
    };
  }, [audioUrl]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = async () => {
    try {
      console.log('Starting recording...');
      await startRecording();
      startListening();
      console.log('Recording started successfully');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: 'Recording Error',
        description: 'Could not start recording. Please check your microphone permissions.',
        variant: 'destructive',
      });
    }
  };

  const handleStopRecording = async () => {
    try {
      console.log('Stopping recording...');
      stopListening();
      await stopRecording();
      console.log('Recording stopped successfully');
    } catch (error) {
      console.error('Error stopping recording:', error);
      toast({
        title: 'Recording Error',
        description: 'There was a problem processing your recording.',
        variant: 'destructive',
      });
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const handleReset = () => {
    resetRecording();
    setTranscribedText('');
    setIsEditing(false);
    stopListening();
  };

  const handleSave = () => {
    console.log('Saving voice journal entry:', { audioUrl, text: transcribedText });
    onComplete(audioUrl, transcribedText);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 100);
  };

  console.log('Voice Journal Render State:', { isRecording, audioUrl, recordingTime });

  return (
    <div className="space-y-4 w-full max-w-2xl mx-auto">
      {!audioUrl ? (
        <div className="flex flex-col items-center justify-center gap-4">
          <div 
            className={cn(
              "relative w-24 h-24 rounded-full flex items-center justify-center",
              isRecording ? "bg-red-100" : "bg-primary/10"
            )}
          >
            <AnimatePresence mode="wait">
              {isRecording ? (
                <motion.div
                  key="recording"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 rounded-full"
                >
                  <div className="absolute inset-0 rounded-full bg-red-500/20 animate-pulse" />
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-24 h-24 rounded-full border-2 border-red-500 bg-white hover:bg-red-50"
                    onClick={handleStopRecording}
                  >
                    <StopCircleIcon className="h-12 w-12 text-red-500" />
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="not-recording"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-24 h-24 rounded-full border-2 border-primary bg-white hover:bg-primary/5"
                    onClick={handleStartRecording}
                  >
                    <MicIcon className="h-12 w-12 text-primary" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {isRecording && (
            <div className="flex items-center gap-3">
              <div className="text-red-500 font-medium">{formatTime(recordingTime)}</div>
              <AudioWaveformIcon className="h-5 w-5 text-red-500 animate-pulse" />
            </div>
          )}
          
          {!isRecording && (
            <div className="text-muted-foreground text-sm">
              Click the microphone to start recording
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-secondary/20 flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "h-10 w-10 rounded-full",
                isPlaying && "bg-primary text-white hover:bg-primary/90"
              )}
              onClick={togglePlay}
            >
              {isPlaying ? (
                <PauseIcon className="h-5 w-5" />
              ) : (
                <PlayIcon className="h-5 w-5" />
              )}
            </Button>
            
            <div className="flex-1">
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '0%' }} />
              </div>
              <audio ref={audioRef} src={audioUrl} className="hidden" />
            </div>
            
            <div className="text-sm text-muted-foreground">
              {formatTime(recordingTime)}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-medium flex items-center gap-1.5">
                <FileTextIcon className="h-4 w-4 text-primary" />
                <span>Transcription</span>
              </div>
              
              {isTranscribing ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Transcribing...
                </div>
              ) : (
                !isEditing && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2"
                    onClick={handleEdit}
                  >
                    Edit
                  </Button>
                )
              )}
            </div>
            
            {isEditing ? (
              <div className="mt-2">
                <textarea
                  ref={textareaRef}
                  className="w-full min-h-[200px] p-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-primary"
                  value={transcribedText}
                  onChange={(e) => setTranscribedText(e.target.value)}
                  placeholder="Edit your transcription..."
                />
                <div className="flex justify-end mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="mr-2"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-3 min-h-[100px] rounded-md border bg-white">
                {transcribedText ? (
                  transcribedText
                ) : (
                  <span className="text-muted-foreground">
                    {isTranscribing ? "Working on transcription..." : "No transcription available"}
                  </span>
                )}
              </div>
            )}
          </div>
          
          <div className="flex justify-between pt-2">
            <Button
              variant="outline"
              className="flex items-center gap-1"
              onClick={handleReset}
              disabled={isSubmitting}
            >
              <RefreshCwIcon className="h-4 w-4" />
              Record Again
            </Button>
            
            <Button
              onClick={handleSave}
              className="flex items-center gap-1"
              disabled={isSubmitting || isTranscribing || (!audioUrl && !transcribedText)}
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckIcon className="h-4 w-4" />
                  Save Journal Entry
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceJournal;
