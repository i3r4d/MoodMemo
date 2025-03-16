
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';

export interface JournalEntry {
  id: string;
  audioUrl: string | null;
  text: string;
  timestamp: string;
  mood: 'joy' | 'calm' | 'neutral' | 'sad' | 'stress' | null;
}

const LOCAL_STORAGE_KEY = 'moodmemo_journal_entries';

export const useJournalStorage = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isPremium } = useAuth();
  const { toast } = useToast();

  // Load entries based on premium status
  useEffect(() => {
    const loadEntries = async () => {
      setIsLoading(true);
      
      try {
        if (user && isPremium) {
          // Premium user: load from database
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
          
          const transformedData = data.map(entry => ({
            id: entry.id,
            text: entry.text,
            audioUrl: entry.audio_url,
            timestamp: entry.timestamp,
            mood: entry.mood as JournalEntry['mood'],
          }));
          
          setEntries(transformedData);
        } else {
          // Free user or not logged in: load from local storage
          try {
            const savedEntries = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedEntries) {
              setEntries(JSON.parse(savedEntries));
            }
          } catch (error) {
            console.error('Error loading journal entries from local storage:', error);
          }
        }
      } catch (error) {
        console.error('Error in loadEntries:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadEntries();
  }, [user, isPremium, toast]);

  // Save entries to local storage for free users
  useEffect(() => {
    if (!isLoading && (!user || !isPremium)) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(entries));
    }
  }, [entries, isLoading, user, isPremium]);

  // Add a new entry
  const addEntry = useCallback(async (entry: Omit<JournalEntry, 'id'>) => {
    try {
      if (user && isPremium) {
        // Premium user: save to database
        const { data, error } = await supabase
          .from('journal_entries')
          .insert({
            user_id: user.id,
            text: entry.text,
            audio_url: entry.audioUrl,
            timestamp: entry.timestamp,
            mood: entry.mood,
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
          return null;
        }
        
        const newEntry: JournalEntry = {
          id: data.id,
          text: entry.text,
          audioUrl: entry.audioUrl,
          timestamp: entry.timestamp,
          mood: entry.mood,
        };
        
        setEntries(prev => [newEntry, ...prev]);
        return newEntry.id;
      } else {
        // Free user: save to local storage
        const newEntry: JournalEntry = {
          ...entry,
          id: uuidv4(),
        };
        
        setEntries(prev => [newEntry, ...prev]);
        return newEntry.id;
      }
    } catch (error) {
      console.error('Error in addEntry:', error);
      return null;
    }
  }, [user, isPremium, toast]);

  // Delete an entry
  const deleteEntry = useCallback(async (id: string) => {
    try {
      if (user && isPremium) {
        // Premium user: delete from database
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
      }
      
      // For both premium and free users, update local state
      setEntries(prev => prev.filter(entry => entry.id !== id));
    } catch (error) {
      console.error('Error in deleteEntry:', error);
    }
  }, [user, isPremium, toast]);

  return {
    entries,
    isLoading,
    addEntry,
    deleteEntry,
    isPremiumStorage: !!(user && isPremium)
  };
};
