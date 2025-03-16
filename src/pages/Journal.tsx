
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import VoiceJournal from '@/components/VoiceJournal';
import JournalEntry from '@/components/JournalEntry';
import { analyzeMood } from '@/utils/moodAnalysis';
import AnimatedTransition from '@/components/AnimatedTransition';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface JournalEntry {
  id: string;
  audioUrl: string | null;
  text: string;
  timestamp: string;
  mood: 'joy' | 'calm' | 'neutral' | 'sad' | 'stress' | null;
}

const Journal = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch journal entries from Supabase
  useEffect(() => {
    const fetchEntries = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('journal_entries')
          .select('id, text, audio_url, timestamp, mood')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false });
        
        if (error) {
          console.error('Error fetching journal entries:', error);
          toast({
            title: 'Error',
            description: 'Failed to load your journal entries',
            variant: 'destructive',
          });
          return;
        }
        
        // Transform data to match our JournalEntry interface
        const transformedData = data.map(entry => ({
          id: entry.id,
          text: entry.text,
          audioUrl: entry.audio_url,
          timestamp: entry.timestamp,
          mood: entry.mood as JournalEntry['mood'],
        }));
        
        setEntries(transformedData);
      } catch (error) {
        console.error('Error in fetchEntries:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEntries();
  }, [user]);

  const uploadAudio = async (audioBlob: Blob): Promise<string | null> => {
    if (!user) return null;
    
    try {
      const fileName = `${user.id}/${uuidv4()}.webm`;
      
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
    if (!user) return;
    
    try {
      // Analyze the mood from the text
      const mood = analyzeMood(text);
      
      let finalAudioUrl = audioUrl;
      
      // If we have audio and it's a blob URL, we need to upload it to Supabase
      if (audioUrl && audioUrl.startsWith('blob:')) {
        const response = await fetch(audioUrl);
        const audioBlob = await response.blob();
        finalAudioUrl = await uploadAudio(audioBlob);
      }
      
      // Current timestamp
      const timestamp = new Date().toISOString();
      
      // Add to Supabase
      const { data, error } = await supabase
        .from('journal_entries')
        .insert({
          user_id: user.id,
          text,
          audio_url: finalAudioUrl,
          timestamp,
          mood,
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error saving journal entry:', error);
        toast({
          title: 'Error',
          description: 'Failed to save your journal entry',
          variant: 'destructive',
        });
        return;
      }
      
      // Add to local state
      const newEntry: JournalEntry = {
        id: data.id,
        text,
        audioUrl: finalAudioUrl,
        timestamp,
        mood,
      };
      
      setEntries(prev => [newEntry, ...prev]);
      
      // Show a toast notification
      toast({
        title: 'Journal Entry Saved',
        description: 'Your entry has been added to your journal.'
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
    if (!user) return;
    
    try {
      // Find the entry to get the audio URL if any
      const entry = entries.find(e => e.id === id);
      
      // Delete from Supabase
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error deleting journal entry:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete your journal entry',
          variant: 'destructive',
        });
        return;
      }
      
      // If there was an audio file, delete it from storage
      if (entry?.audioUrl) {
        // Extract the path from the URL
        const url = new URL(entry.audioUrl);
        const pathParts = url.pathname.split('/');
        const filePath = pathParts.slice(pathParts.indexOf('audio_files') + 1).join('/');
        
        const { error: storageError } = await supabase.storage
          .from('audio_files')
          .remove([filePath]);
        
        if (storageError) {
          console.error('Error deleting audio file:', storageError);
        }
      }
      
      // Update local state
      setEntries(prev => prev.filter(entry => entry.id !== id));
      
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
