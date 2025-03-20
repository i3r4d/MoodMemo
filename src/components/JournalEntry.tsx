import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { JournalEntry as JournalEntryType } from '@/hooks/useJournalEntries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SentimentAnalysis from './SentimentAnalysis';

interface JournalEntryProps {
  entry: JournalEntryType;
  onDelete: (id: string) => void;
}

const JournalEntry: React.FC<JournalEntryProps> = ({ entry, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Format the timestamp
  const formattedDate = format(new Date(entry.timestamp), 'PPP');
  const formattedTime = format(new Date(entry.timestamp), 'h:mm a');
  
  // Get mood color
  const getMoodColor = (mood: JournalEntryType['mood']) => {
    switch(mood) {
      case 'joy': return 'bg-mood-joy';
      case 'calm': return 'bg-mood-calm';
      case 'neutral': return 'bg-mood-neutral';
      case 'sad': return 'bg-mood-sad';
      case 'stress': return 'bg-mood-stress';
      default: return 'bg-gray-300';
    }
  };
  
  // Get mood text
  const getMoodText = (mood: JournalEntryType['mood']) => {
    switch(mood) {
      case 'joy': return 'Joyful';
      case 'calm': return 'Calm';
      case 'neutral': return 'Neutral';
      case 'sad': return 'Sad';
      case 'stress': return 'Stressed';
      default: return 'Unknown';
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {formattedDate}
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{entry.mood}</Badge>
          {entry.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none">
          {entry.text}
        </div>
        
        {entry.sentimentAnalysis && (
          <div className="mt-4">
            <SentimentAnalysis
              {...entry.sentimentAnalysis}
              onSuggestionClick={() => {}}
            />
          </div>
        )}
        
        {entry.audioUrl && (
          <div className="mt-4">
            <audio controls className="w-full">
              <source src={entry.audioUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JournalEntry;
