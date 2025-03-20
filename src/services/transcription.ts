import { supabase } from '@/lib/supabase';
import { Language } from '@/contexts/LanguageContext';

interface TranscriptionOptions {
  language: Language;
  model?: 'default' | 'enhanced';
  punctuate?: boolean;
  profanityFilter?: boolean;
}

interface TranscriptionResult {
  text: string;
  confidence: number;
  language: string;
  duration: number;
  words: Array<{
    word: string;
    start: number;
    end: number;
    confidence: number;
  }>;
}

const LANGUAGE_CODES: Record<Language, string> = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  it: 'it-IT',
  pt: 'pt-PT',
  ru: 'ru-RU',
  zh: 'zh-CN',
  ja: 'ja-JP',
  ko: 'ko-KR',
};

export class TranscriptionService {
  private static instance: TranscriptionService;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  private constructor() {}

  static getInstance(): TranscriptionService {
    if (!TranscriptionService.instance) {
      TranscriptionService.instance = new TranscriptionService();
    }
    return TranscriptionService.instance;
  }

  async startRecording(options: TranscriptionOptions): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(1000); // Collect data every second
    } catch (error) {
      console.error('Error starting recording:', error);
      throw new Error('Failed to start recording');
    }
  }

  async stopRecording(): Promise<TranscriptionResult> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'));
        return;
      }

      this.mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          const result = await this.transcribeAudio(audioBlob);
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.cleanup();
        }
      };

      this.mediaRecorder.stop();
    });
  }

  private async transcribeAudio(audioBlob: Blob): Promise<TranscriptionResult> {
    try {
      // Upload audio to Supabase Storage
      const fileName = `transcription-${Date.now()}.webm`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('audio')
        .upload(fileName, audioBlob);

      if (uploadError) throw uploadError;

      // Call the transcription edge function
      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: {
          filePath: uploadData.path,
          language: LANGUAGE_CODES[this.currentLanguage],
          options: this.currentOptions,
        },
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error transcribing audio:', error);
      throw new Error('Failed to transcribe audio');
    }
  }

  private cleanup(): void {
    if (this.mediaRecorder) {
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
      this.mediaRecorder = null;
    }
    this.audioChunks = [];
  }

  private currentLanguage: Language = 'en';
  private currentOptions: TranscriptionOptions = {
    language: 'en',
    model: 'default',
    punctuate: true,
    profanityFilter: true,
  };

  setOptions(options: TranscriptionOptions): void {
    this.currentOptions = options;
    this.currentLanguage = options.language;
  }
}

export const transcriptionService = TranscriptionService.getInstance(); 