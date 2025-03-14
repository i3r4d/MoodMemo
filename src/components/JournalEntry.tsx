
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { JournalEntry as JournalEntryType } from '@/hooks/useJournalEntries';

interface JournalEntryProps {
  entry: JournalEntryType;
  onDelete: (id: string) => void;
}

const JournalEntry: React.FC<JournalEntryProps> = ({ entry, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Format the timestamp
  const formattedDate = format(new Date(entry.timestamp), 'MMM d, yyyy');
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
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className={cn(
        "glass-morphism mood-journal-card overflow-hidden",
        isExpanded && "border-primary/20"
      )}
    >
      <motion.div layout className="flex flex-col space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">{formattedDate}</span>
            <span className="text-xs text-muted-foreground/70">{formattedTime}</span>
          </div>
          
          {entry.mood && (
            <div className="flex items-center gap-1.5">
              <div className={`h-3 w-3 rounded-full ${getMoodColor(entry.mood)}`} />
              <span className="text-xs font-medium">{getMoodText(entry.mood)}</span>
            </div>
          )}
        </div>
        
        <motion.div 
          layout
          className={cn(
            "text-sm leading-relaxed whitespace-pre-wrap",
            !isExpanded && "line-clamp-3"
          )}
        >
          {entry.text}
        </motion.div>
        
        <motion.div layout className="flex justify-between items-center pt-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-primary font-medium hover:underline focus:outline-none"
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
          
          <div className="flex gap-2">
            {entry.audioUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <audio
                  src={entry.audioUrl}
                  controls
                  className="h-8 w-32 sm:w-44"
                />
              </motion.div>
            )}
            
            <button
              onClick={() => onDelete(entry.id)}
              className="p-1.5 text-destructive/70 hover:text-destructive rounded focus:outline-none focus:ring-1 focus:ring-destructive/30"
              aria-label="Delete entry"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default JournalEntry;
