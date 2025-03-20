import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Mic, Square, Loader2, Pause, Play } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { transcriptionService } from '@/services/transcription';
import { useLanguage } from '@/contexts/LanguageContext';
import { useVoiceCommands } from '@/services/VoiceCommandsService';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  onTranscriptionComplete?: (text: string) => void;
}

export function VoiceRecorder({
  onRecordingComplete,
  onTranscriptionComplete,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { registerCommand, unregisterCommand } = useVoiceCommands();

  useEffect(() => {
    // Register voice commands
    registerCommand(
      t('voice_commands.commands.start_recording'),
      startRecording,
      t('voice_commands.commands.start_recording')
    );
    registerCommand(
      t('voice_commands.commands.stop_recording'),
      stopRecording,
      t('voice_commands.commands.stop_recording')
    );
    registerCommand(
      t('voice_commands.commands.pause_recording'),
      pauseRecording,
      t('voice_commands.commands.pause_recording')
    );
    registerCommand(
      t('voice_commands.commands.resume_recording'),
      resumeRecording,
      t('voice_commands.commands.resume_recording')
    );

    return () => {
      // Unregister voice commands
      unregisterCommand(t('voice_commands.commands.start_recording'));
      unregisterCommand(t('voice_commands.commands.stop_recording'));
      unregisterCommand(t('voice_commands.commands.pause_recording'));
      unregisterCommand(t('voice_commands.commands.resume_recording'));
    };
  }, [t]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks((chunks) => [...chunks, event.data]);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        onRecordingComplete(audioBlob);
        setAudioChunks([]);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);

      toast({
        title: t('voice_recorder.recording_started'),
        description: t('voice_recorder.recording_started_description'),
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: t('voice_recorder.error'),
        description: t('voice_recorder.error_description'),
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setIsPaused(false);

      toast({
        title: t('voice_recorder.recording_stopped'),
        description: t('voice_recorder.recording_stopped_description'),
      });
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);

      toast({
        title: t('voice_recorder.recording_paused'),
        description: t('voice_recorder.recording_paused_description'),
      });
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);

      toast({
        title: t('voice_recorder.recording_resumed'),
        description: t('voice_recorder.recording_resumed_description'),
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{t('recording.title')}</h3>
          <div className="flex items-center space-x-4">
            <Button
              variant={isRecording ? 'destructive' : 'default'}
              size="icon"
              onClick={isRecording ? stopRecording : startRecording}
              className="rounded-full"
            >
              {isRecording ? (
                <Square className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
            {isRecording && (
              <Button
                variant="outline"
                size="icon"
                onClick={isPaused ? resumeRecording : pauseRecording}
                className="rounded-full"
              >
                {isPaused ? (
                  <Play className="h-4 w-4" />
                ) : (
                  <Pause className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t('recording.language')}</label>
          <Select value="en" onValueChange={(value) => {}}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              <SelectItem value="de">German</SelectItem>
              <SelectItem value="it">Italian</SelectItem>
              <SelectItem value="pt">Portuguese</SelectItem>
              <SelectItem value="ru">Russian</SelectItem>
              <SelectItem value="zh">Chinese</SelectItem>
              <SelectItem value="ja">Japanese</SelectItem>
              <SelectItem value="ko">Korean</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t('recording.enhanced_model')}</label>
            <Switch
              checked={false}
              onCheckedChange={(value) => {}}
              disabled={isRecording}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {t('recording.enhanced_model_description')}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t('recording.punctuation')}</label>
            <Switch
              checked={true}
              onCheckedChange={(value) => {}}
              disabled={isRecording}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {t('recording.punctuation_description')}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t('recording.profanity_filter')}</label>
            <Switch
              checked={true}
              onCheckedChange={(value) => {}}
              disabled={isRecording}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {t('recording.profanity_filter_description')}
          </p>
        </div>
      </div>
    </Card>
  );
} 