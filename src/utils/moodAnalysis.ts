
// This is a placeholder for future integration with sentiment analysis API
// In a real implementation, we would integrate with Hugging Face's API

export type MoodType = 'joy' | 'calm' | 'neutral' | 'sad' | 'stress' | null;

// Mock function to simulate sentiment analysis
export const analyzeMood = (text: string): MoodType => {
  if (!text) return null;
  
  const lowerText = text.toLowerCase();
  
  // Very basic keyword matching
  if (lowerText.includes('happy') || lowerText.includes('joy') || lowerText.includes('excited') || lowerText.includes('great')) {
    return 'joy';
  } else if (lowerText.includes('calm') || lowerText.includes('peaceful') || lowerText.includes('relaxed')) {
    return 'calm';
  } else if (lowerText.includes('sad') || lowerText.includes('upset') || lowerText.includes('depressed')) {
    return 'sad';
  } else if (lowerText.includes('stress') || lowerText.includes('anxious') || lowerText.includes('worried')) {
    return 'stress';
  } else {
    // For demo purposes, we'll randomize when there's no clear match
    const moods: MoodType[] = ['joy', 'calm', 'neutral', 'sad', 'stress'];
    return moods[Math.floor(Math.random() * moods.length)];
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

// Generate mock weekly mood data for dashboard
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
