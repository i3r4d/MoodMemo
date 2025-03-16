
import { useState, useRef, useCallback } from 'react';

interface UseVoiceRecorderReturn {
  isRecording: boolean;
  recordingTime: number;
  audioUrl: string | null;
  recordingBlob: Blob | null; // Add this property
  error: Error | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  resetRecording: () => void;
}

export const useVoiceRecorder = (): UseVoiceRecorderReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null); // Add this state
  const [error, setError] = useState<Error | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  
  const startRecording = useCallback(async () => {
    try {
      // Reset states
      setError(null);
      setAudioUrl(null);
      setRecordingBlob(null);
      audioChunksRef.current = [];
      
      // Get media stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      
      // Start timer
      let seconds = 0;
      timerRef.current = window.setInterval(() => {
        seconds++;
        setRecordingTime(seconds);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error in useVoiceRecorder'));
      console.error('Error starting recording:', err);
    }
  }, []);
  
  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        setIsRecording(false);
        resolve(null);
        return;
      }
      
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Handle recording completion
      mediaRecorderRef.current.onstop = () => {
        // Combine audio chunks into a single blob
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordingBlob(audioBlob); // Set the blob in state
        
        // Create URL for the audio blob
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Stop all tracks in the stream
        if (mediaRecorderRef.current) {
          const stream = mediaRecorderRef.current.stream;
          stream.getTracks().forEach(track => track.stop());
        }
        
        setIsRecording(false);
        resolve(audioBlob);
      };
      
      // Stop recording
      mediaRecorderRef.current.stop();
    });
  }, []);
  
  const resetRecording = useCallback(() => {
    // Revoke object URL to prevent memory leaks
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    
    // Reset states
    setAudioUrl(null);
    setRecordingTime(0);
    setRecordingBlob(null);
    setError(null);
    audioChunksRef.current = [];
  }, [audioUrl]);
  
  return {
    isRecording,
    recordingTime,
    audioUrl,
    recordingBlob, // Include this in the return
    error,
    startRecording,
    stopRecording,
    resetRecording,
  };
};
