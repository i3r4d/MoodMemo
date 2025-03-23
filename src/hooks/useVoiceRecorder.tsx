
import { useState, useRef, useCallback, useEffect } from 'react';

interface UseVoiceRecorderReturn {
  isRecording: boolean;
  recordingTime: number;
  audioUrl: string | null;
  recordingBlob: Blob | null;
  error: Error | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  resetRecording: () => void;
}

export const useVoiceRecorder = (): UseVoiceRecorderReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Cleanup function to ensure we always stop the stream when component unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);
  
  const startRecording = useCallback(async () => {
    try {
      // Reset states
      setError(null);
      setAudioUrl(null);
      setRecordingBlob(null);
      audioChunksRef.current = [];
      setRecordingTime(0);
      
      // Get media stream
      console.log('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      console.log('Microphone access granted, creating MediaRecorder');
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        console.log('Data available from media recorder', event.data.size);
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      // Start recording
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      console.log('MediaRecorder started');
      
      // Start timer
      let seconds = 0;
      timerRef.current = window.setInterval(() => {
        seconds++;
        setRecordingTime(seconds);
      }, 1000);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError(err instanceof Error ? err : new Error('Unknown error in useVoiceRecorder'));
    }
  }, []);
  
  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    console.log('stopRecording called, mediaRecorder state:', mediaRecorderRef.current?.state);
    
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        console.log('No active recording to stop');
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
        console.log('MediaRecorder stopped, processing audio chunks');
        // Combine audio chunks into a single blob
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordingBlob(audioBlob);
        
        // Create URL for the audio blob
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Stop all tracks in the stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => {
            console.log('Stopping track:', track.kind);
            track.stop();
          });
          streamRef.current = null;
        }
        
        setIsRecording(false);
        console.log('Recording processed successfully, blob size:', audioBlob.size);
        resolve(audioBlob);
      };
      
      // Stop recording
      try {
        mediaRecorderRef.current.stop();
        console.log('MediaRecorder.stop() called');
      } catch (e) {
        console.error('Error stopping MediaRecorder:', e);
        
        // Fallback cleanup
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        
        setIsRecording(false);
        resolve(null);
      }
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
    recordingBlob,
    error,
    startRecording,
    stopRecording,
    resetRecording,
  };
};
