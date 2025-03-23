
import { supabase } from '@/lib/supabase';

export type MoodType = 'joy' | 'calm' | 'neutral' | 'sad' | 'stress' | null;

// Function to analyze text using an API or fallback
export const analyzeMood = async (text: string): Promise<MoodType> => {
  if (!text) return 'neutral';
  
  console.log('Analyzing mood for text:', text);
  
  try {
    // Use fallback for now to ensure reliability
    return fallbackAnalyzeMood(text);
    
    /* Edge function call - Commenting this out until it's confirmed working
    // Call the sentiment analysis edge function
    const { data, error } = await supabase.functions.invoke('analyze-mood', {
      body: { text },
    });
    
    if (error) {
      console.error('Error analyzing mood:', error);
      return fallbackAnalyzeMood(text);
    }
    
    console.log('Mood analysis result:', data);
    return data.mood as MoodType;
    */
  } catch (error) {
    console.error('Error in mood analysis:', error);
    // Use fallback if API fails
    return fallbackAnalyzeMood(text);
  }
};

// Fallback function for when the API call fails
const fallbackAnalyzeMood = (text: string): MoodType => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('happy') || lowerText.includes('joy') || lowerText.includes('excited') || 
      lowerText.includes('great') || lowerText.includes('wonderful') || lowerText.includes('fantastic')) {
    return 'joy';
  } else if (lowerText.includes('calm') || lowerText.includes('peaceful') || lowerText.includes('relaxed') ||
             lowerText.includes('serene') || lowerText.includes('tranquil')) {
    return 'calm';
  } else if (lowerText.includes('sad') || lowerText.includes('upset') || lowerText.includes('depressed') ||
             lowerText.includes('unhappy') || lowerText.includes('miserable')) {
    return 'sad';
  } else if (lowerText.includes('stress') || lowerText.includes('anxious') || lowerText.includes('worried') ||
             lowerText.includes('nervous') || lowerText.includes('tense')) {
    return 'stress';
  } else {
    return 'neutral';
  }
};

// Get color for a mood
export const getMoodColor = (mood: MoodType): string => {
  switch (mood) {
    case 'joy': return '#89CFF0';
    case 'calm': return '#A7C7E7';
    case 'neutral': return '#B6D0E2';
    case 'sad': return '#9EB6C3';
    case 'stress': return '#7393B3';
    default: return '#B8B8B8';
  }
};

// Get a human-readable mood description
export const getMoodDescription = (mood: MoodType): string => {
  switch (mood) {
    case 'joy': return 'Joyful';
    case 'calm': return 'Calm';
    case 'neutral': return 'Neutral';
    case 'sad': return 'Sad';
    case 'stress': return 'Stressed';
    default: return 'Unknown';
  }
};

// Generate mock weekly mood data for dashboard (fallback)
export const generateMockWeeklyData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  return days.map(day => ({
    day,
    joy: Math.floor(Math.random() * 3),
    calm: Math.floor(Math.random() * 3),
    neutral: Math.floor(Math.random() * 3),
    sad: Math.floor(Math.random() * 2),
    stress: Math.floor(Math.random() * 2),
  }));
};
