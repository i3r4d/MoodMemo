
export interface JournalEntry {
  id: string;
  text: string;
  audioUrl?: string | null;
  timestamp: string;
  mood: MoodType | null;
  moodIntensity?: number;
  tags: string[];
  userId?: string;
  user_id?: string;
  template?: string;
  formatting?: {
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

export type MoodType = 'joy' | 'calm' | 'neutral' | 'sad' | 'stress';

export interface Prompt {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  mood_boost: number;
  user_rating?: number;
  prompt_text?: string;
  description?: string;
  follow_up_questions?: string[];
}
