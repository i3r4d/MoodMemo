
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import VoiceJournal from '@/components/VoiceJournal';
import JournalEntry from '@/components/JournalEntry';
import useJournalEntries from '@/hooks/useJournalEntries';
import { analyzeMood } from '@/utils/moodAnalysis';
import AnimatedTransition from '@/components/AnimatedTransition';

const Journal = () => {
  const { 
    entries, 
    isLoading, 
    addEntry, 
    deleteEntry 
  } = useJournalEntries();
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSaveJournal = (audioUrl: string | null, text: string) => {
    // Analyze the mood from the text
    const mood = analyzeMood(text);
    
    // Add the new entry with current timestamp
    addEntry({
      audioUrl,
      text,
      timestamp: new Date().toISOString(),
      mood
    });
    
    // Show a toast notification
    toast({
      title: 'Journal Entry Saved',
      description: 'Your entry has been added to your journal.'
    });
  };

  const handleDeleteEntry = (id: string) => {
    deleteEntry(id);
    
    toast({
      title: 'Entry Deleted',
      description: 'Your journal entry has been removed.'
    });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (!mounted) return null;

  return (
    <AnimatedTransition keyValue="journal">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-2xl mx-auto space-y-8"
      >
        <motion.div variants={itemVariants}>
          <h1 className="sr-only">Journal</h1>
          <VoiceJournal onSave={handleSaveJournal} />
        </motion.div>
        
        {entries.length > 0 ? (
          <motion.div variants={itemVariants} className="space-y-2">
            <div className="flex items-center justify-between pb-2">
              <h2 className="text-lg font-medium">Recent Entries</h2>
              <span className="text-sm text-muted-foreground">
                {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
              </span>
            </div>
            
            <motion.div
              variants={containerVariants}
              className="space-y-4"
            >
              {entries.map((entry) => (
                <motion.div
                  key={entry.id}
                  variants={itemVariants}
                  layout
                >
                  <JournalEntry 
                    entry={entry} 
                    onDelete={handleDeleteEntry} 
                  />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            variants={itemVariants}
            className="text-center py-12"
          >
            {isLoading ? (
              <div className="flex justify-center">
                <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-center">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                  </div>
                </div>
                <p className="text-muted-foreground">No journal entries yet</p>
                <p className="text-sm text-muted-foreground/70">
                  Record your first entry using the voice recorder or type directly.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </AnimatedTransition>
  );
};

export default Journal;
