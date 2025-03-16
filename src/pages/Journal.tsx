
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import VoiceJournal from '@/components/VoiceJournal';
import JournalEntry from '@/components/JournalEntry';
import { analyzeMood } from '@/utils/moodAnalysis';
import AnimatedTransition from '@/components/AnimatedTransition';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useJournalStorage } from '@/hooks/useJournalStorage';

const Journal = () => {
  const [mounted, setMounted] = useState(false);
  const { user, isPremium } = useAuth();
  const { entries, isLoading, addEntry, deleteEntry, isPremiumStorage } = useJournalStorage();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const uploadAudio = async (audioBlob: Blob): Promise<string | null> => {
    if (!user) return null;
    
    try {
      const fileName = `${user.id}/${crypto.randomUUID()}.webm`;
      
      const { data, error } = await supabase.storage
        .from('audio_files')
        .upload(fileName, audioBlob, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'audio/webm',
        });
      
      if (error) {
        console.error('Error uploading audio:', error);
        return null;
      }
      
      const { data: publicUrlData } = supabase.storage
        .from('audio_files')
        .getPublicUrl(fileName);
      
      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error in uploadAudio:', error);
      return null;
    }
  };

  const handleSaveJournal = async (audioUrl: string | null, text: string) => {
    try {
      // Analyze the mood from the text
      const mood = analyzeMood(text);
      
      let finalAudioUrl = audioUrl;
      
      // If we have audio and it's a blob URL, we need to upload it to Supabase for premium users
      if (audioUrl && audioUrl.startsWith('blob:') && user && isPremium) {
        const response = await fetch(audioUrl);
        const audioBlob = await response.blob();
        finalAudioUrl = await uploadAudio(audioBlob);
      }
      
      // Current timestamp
      const timestamp = new Date().toISOString();
      
      // Add entry
      await addEntry({
        text,
        audioUrl: finalAudioUrl,
        timestamp,
        mood,
      });
      
      // Show a toast notification
      toast({
        title: 'Journal Entry Saved',
        description: isPremiumStorage 
          ? 'Your entry has been saved to your account.' 
          : 'Your entry has been saved locally on your device.',
      });
    } catch (error) {
      console.error('Error in handleSaveJournal:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong while saving your journal entry',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      await deleteEntry(id);
      
      toast({
        title: 'Entry Deleted',
        description: 'Your journal entry has been removed.'
      });
    } catch (error) {
      console.error('Error in handleDeleteEntry:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong while deleting your journal entry',
        variant: 'destructive',
      });
    }
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
        {!user && (
          <motion.div 
            variants={itemVariants}
            className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-yellow-800 mb-4"
          >
            <p className="font-medium">Free Account Mode</p>
            <p className="text-sm">Your journal entries are stored locally on your device. Sign up for a premium account to save your entries to the cloud.</p>
          </motion.div>
        )}

        {user && !isPremium && (
          <motion.div 
            variants={itemVariants}
            className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-yellow-800 mb-4"
          >
            <p className="font-medium">Free Account</p>
            <p className="text-sm">Your journal entries are stored locally on your device. Upgrade to premium to save your entries to the cloud.</p>
          </motion.div>
        )}
        
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
