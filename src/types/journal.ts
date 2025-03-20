export interface JournalEntry {
  id: string;
  text: string;
  audioUrl?: string | null;
  timestamp: string;
  mood: string;
  moodIntensity: number;
  tags: string[];
  template?: string;
  formatting: {
    bold: boolean;
    italic: boolean;
    list: boolean;
  };
  sentimentAnalysis?: {
    sentiment: 'positive' | 'neutral' | 'negative';
    confidence: number;
    emotions: string[];
    suggestions: string[];
    summary: string;
  } | null;
} 