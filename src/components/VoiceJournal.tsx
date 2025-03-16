
import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { useVoiceTranscription } from '@/hooks/useVoiceTranscription';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface VoiceJournalProps {
  onSave: (audioUrl: string | null, text: string) => void;
}

// Array of journal prompts to display to the user
const journalPrompts = [
  "What's one thing that made you smile today?",
  "Describe a moment when you felt proud of yourself.",
  "What's been on your mind lately?",
  "What are you grateful for today?",
  "How would you describe your mood right now?",
  "What's one challenge you're currently facing?",
  "What's something you're looking forward to?",
  "Reflect on a conversation that impacted you recently.",
  "What's something you've learned about yourself lately?",
  "What's one small win you had today?",
  "How did you practice self-care today?",
  "What would make tomorrow great?",
];

const VoiceJournal: React.FC<VoiceJournalProps> = ({ onSave }) => {
  const [text, setText] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState('');
  const { isPremium } = useAuth();
  
  // Web Speech API recognition
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  
  // Initialize Web Speech API
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        setText(prevText => prevText + finalTranscript);
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          toast({
            title: "Microphone Access Denied",
            description: "Please enable microphone access to use voice recording.",
            variant: "destructive",
          });
        }
      };
      
      setRecognition(recognitionInstance);
    }
  }, []);
  
  // Voice recorder hook for audio recording
  const { 
    isRecording, 
    audioUrl, 
    startRecording: startMediaRecording, 
    stopRecording: stopMediaRecording, 
    recordingTime,
    audioBlob
  } = useVoiceRecorder();

  // Server-based voice transcription for premium users
  const { 
    isTranscribing, 
    transcribeAudio 
  } = useVoiceTranscription({
    onTranscriptionComplete: (transcriptionText) => {
      setText(prevText => prevText + transcriptionText);
    }
  });

  // Select a random prompt when the component mounts
  useEffect(() => {
    setCurrentPrompt(journalPrompts[Math.floor(Math.random() * journalPrompts.length)]);
  }, []);

  const startSpeechRecognition = () => {
    if (recognition) {
      try {
        recognition.start();
        return true;
      } catch (err) {
        console.error('Error starting speech recognition:', err);
        return false;
      }
    }
    return false;
  };
  
  const stopSpeechRecognition = () => {
    if (recognition) {
      try {
        recognition.stop();
      } catch (err) {
        console.error('Error stopping speech recognition:', err);
      }
    }
  };

  const handleStartRecording = async () => {
    try {
      // Start browser-based speech recognition
      const speechStarted = startSpeechRecognition();
      
      // Start media recording for storing the audio
      await startMediaRecording();
      
      if (!speechStarted) {
        toast({
          title: "Speech Recognition Unavailable",
          description: "Your browser doesn't support speech recognition. " + 
            (isPremium ? "Premium server-based transcription will be used instead." : "Text transcription will be unavailable."),
          variant: "warning",
        });
      }
    } catch (err) {
      toast({
        title: "Recording Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };
  
  const handleStopRecording = async () => {
    // Stop browser-based speech recognition
    stopSpeechRecognition();
    
    // Stop media recording
    const blob = await stopMediaRecording();
    
    // For premium users, use server-based transcription
    if (isPremium && blob) {
      try {
        await transcribeAudio(blob);
      } catch (error) {
        console.error("Error in server transcription:", error);
        // We already show a toast in the hook, no need to show another
      }
    }
  };

  const handleSave = useCallback(() => {
    if (text.trim()) {
      onSave(audioUrl, text);
      setText('');
      // Set a new random prompt after saving
      setCurrentPrompt(journalPrompts[Math.floor(Math.random() * journalPrompts.length)]);
    } else {
      toast({
        title: "Cannot Save",
        description: "Please record or type something first.",
        variant: "destructive",
      });
    }
  }, [audioUrl, text, onSave]);

  const formatRecordingTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  return (
    <div className="space-y-4">
      {/* Journal Prompt Section */}
      <div className="bg-primary/5 p-4 rounded-lg border border-primary/10 mb-2">
        <h3 className="text-sm font-medium text-primary/80 mb-1">Today's Journal Prompt:</h3>
        <p className="text-lg font-medium">{currentPrompt}</p>
      </div>
      
      <div className={cn(
        "glass-morphism mood-journal-card space-y-4",
        "transition-all duration-300 ease-in-out",
        isRecording && "shadow-md border-red-100"
      )}>
        <AnimatePresence mode="wait">
          {isRecording ? (
            <motion.div 
              key="recording"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-6"
            >
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping" />
                <div className="relative bg-red-500 text-white h-16 w-16 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {formatRecordingTime(recordingTime)}
                  </span>
                </div>
              </div>
              
              <motion.div 
                className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <span>Listening to your thoughts...</span>
              </motion.div>
              
              <motion.button
                onClick={handleStopRecording}
                className={cn(
                  "mt-6 px-5 py-2 rounded-lg bg-primary/90 text-white",
                  "hover:bg-primary focus-ring font-medium"
                )}
                whileTap={{ scale: 0.98 }}
              >
                Stop Recording
              </motion.button>
            </motion.div>
          ) : (
            <motion.div 
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="relative">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="What's on your mind today? Click the microphone or type here..."
                  className={cn(
                    "w-full min-h-[120px] p-4 rounded-lg resize-none",
                    "bg-background/50 border border-border",
                    "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50",
                    "placeholder:text-muted-foreground/70",
                    isTranscribing && "opacity-50"
                  )}
                  disabled={isTranscribing}
                />
                
                {isTranscribing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/30 backdrop-blur-sm rounded-lg">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-muted-foreground">
                        Transcribing with premium service...
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {audioUrl && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-secondary/50 rounded-lg p-3"
                >
                  <audio src={audioUrl} controls className="w-full h-8" />
                </motion.div>
              )}
              
              <div className="flex justify-between">
                <button
                  onClick={handleStartRecording}
                  disabled={isRecording || isTranscribing}
                  className={cn(
                    "p-3 rounded-full flex items-center gap-2",
                    "bg-primary/10 text-primary",
                    "hover:bg-primary/20 focus-ring",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" y1="19" x2="12" y2="22"></line>
                  </svg>
                  <span className="font-medium">New Voice Entry</span>
                </button>
                
                <button
                  onClick={handleSave}
                  disabled={!text.trim() || isTranscribing}
                  className={cn(
                    "px-4 py-2 rounded-lg",
                    "bg-primary text-white",
                    "hover:bg-primary/90 focus-ring font-medium",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  Save Entry
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VoiceJournal;
