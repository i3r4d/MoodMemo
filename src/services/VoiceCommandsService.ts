import { useCallback, useEffect, useState } from 'react';

type CommandHandler = () => void;

interface VoiceCommand {
  command: string;
  handler: CommandHandler;
  description: string;
}

export class VoiceCommandsService {
  private static instance: VoiceCommandsService;
  private recognition: SpeechRecognition | null = null;
  private commands: Map<string, VoiceCommand> = new Map();
  private isEnabled: boolean = false;

  private constructor() {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window.webkitSpeechRecognition as any)();
      this.setupRecognition();
    }
  }

  public static getInstance(): VoiceCommandsService {
    if (!VoiceCommandsService.instance) {
      VoiceCommandsService.instance = new VoiceCommandsService();
    }
    return VoiceCommandsService.instance;
  }

  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript.toLowerCase())
        .join('');

      this.processCommand(transcript);
    };

    this.recognition.onerror = (event: SpeechRecognitionError) => {
      console.error('Speech recognition error:', event.error);
    };
  }

  private processCommand(transcript: string) {
    if (!this.isEnabled) return;

    for (const [command, { handler }] of this.commands) {
      if (transcript.includes(command.toLowerCase())) {
        handler();
        break;
      }
    }
  }

  public registerCommand(command: string, handler: CommandHandler, description: string) {
    this.commands.set(command.toLowerCase(), { command, handler, description });
  }

  public unregisterCommand(command: string) {
    this.commands.delete(command.toLowerCase());
  }

  public start() {
    if (!this.recognition || !this.isEnabled) return;
    this.recognition.start();
  }

  public stop() {
    if (!this.recognition) return;
    this.recognition.stop();
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (enabled) {
      this.start();
    } else {
      this.stop();
    }
  }

  public getCommands(): VoiceCommand[] {
    return Array.from(this.commands.values());
  }
}

export function useVoiceCommands() {
  const [isEnabled, setIsEnabled] = useState(false);
  const service = VoiceCommandsService.getInstance();

  useEffect(() => {
    return () => {
      service.stop();
    };
  }, []);

  const toggleVoiceCommands = useCallback((enabled: boolean) => {
    setIsEnabled(enabled);
    service.setEnabled(enabled);
  }, []);

  const registerCommand = useCallback(
    (command: string, handler: CommandHandler, description: string) => {
      service.registerCommand(command, handler, description);
    },
    []
  );

  const unregisterCommand = useCallback((command: string) => {
    service.unregisterCommand(command);
  }, []);

  return {
    isEnabled,
    toggleVoiceCommands,
    registerCommand,
    unregisterCommand,
    getCommands: service.getCommands.bind(service),
  };
} 