
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface JournalEntry {
  id: string;
  audioUrl: string | null;
  text: string;
  timestamp: string;
  mood: 'joy' | 'calm' | 'neutral' | 'sad' | 'stress' | null;
}

const STORAGE_KEY = 'moodmemo_journal_entries';

const useJournalEntries = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load entries from localStorage or Supabase on mount
  useEffect(() => {
    const loadEntries = async () => {
      try {
        setIsLoading(true);
        if (user) {
          // Try to load from Supabase first
          const { data, error } = await supabase
            .from('journal_entries')
            .select('id, text, audio_url, timestamp, mood')
            .eq('user_id', user.id)
            .order('timestamp', { ascending: false });
          
          if (error) {
            console.error('Error loading entries from Supabase:', error);
            // Fall back to localStorage
            loadFromLocalStorage();
          } else if (data) {
            // Format the data
            const formattedEntries = data.map(entry => ({
              id: entry.id,
              text: entry.text,
              audioUrl: entry.audio_url,
              timestamp: entry.timestamp,
              mood: entry.mood as JournalEntry['mood']
            }));
            setEntries(formattedEntries);
          }
        } else {
          // If not logged in, load from localStorage
          loadFromLocalStorage();
        }
      } catch (error) {
        console.error('Error loading journal entries:', error);
        loadFromLocalStorage();
      } finally {
        setIsLoading(false);
      }
    };

    const loadFromLocalStorage = () => {
      try {
        const savedEntries = localStorage.getItem(STORAGE_KEY);
        if (savedEntries) {
          setEntries(JSON.parse(savedEntries));
        }
      } catch (error) {
        console.error('Error loading from localStorage:', error);
      }
    };

    loadEntries();
  }, [user]);

  // Save entries to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    }
  }, [entries, isLoading]);

  // Add a new entry
  const addEntry = useCallback(async (entry: Omit<JournalEntry, 'id'>) => {
    const newId = Date.now().toString();
    const newEntry: JournalEntry = {
      ...entry,
      id: newId,
    };

    // Add to local state first for immediate UI update
    setEntries(prevEntries => [newEntry, ...prevEntries]);

    // If user is authenticated, also save to Supabase
    if (user) {
      try {
        const { error } = await supabase
          .from('journal_entries')
          .insert([{
            user_id: user.id,
            text: entry.text,
            audio_url: entry.audioUrl,
            timestamp: entry.timestamp,
            mood: entry.mood
          }]);
        
        if (error) {
          console.error('Error saving journal entry:', error);
          toast({
            title: "Save Error",
            description: "Your entry was saved locally but failed to sync to the cloud.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error in add entry:', error);
      }
    }

    return newId;
  }, [user, toast]);

  // Update an existing entry
  const updateEntry = useCallback(async (id: string, updatedFields: Partial<JournalEntry>) => {
    setEntries(prevEntries =>
      prevEntries.map(entry =>
        entry.id === id ? { ...entry, ...updatedFields } : entry
      )
    );

    // If user is authenticated, also update in Supabase
    if (user) {
      try {
        const { error } = await supabase
          .from('journal_entries')
          .update({
            text: updatedFields.text,
            audio_url: updatedFields.audioUrl,
            mood: updatedFields.mood,
            timestamp: updatedFields.timestamp
          })
          .eq('id', id)
          .eq('user_id', user.id);
        
        if (error) {
          console.error('Error updating journal entry:', error);
        }
      } catch (error) {
        console.error('Error in update entry:', error);
      }
    }
  }, [user]);

  // Delete an entry
  const deleteEntry = useCallback(async (id: string) => {
    setEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));

    // If user is authenticated, also delete from Supabase
    if (user) {
      try {
        const { error } = await supabase
          .from('journal_entries')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
        
        if (error) {
          console.error('Error deleting journal entry:', error);
        }
      } catch (error) {
        console.error('Error in delete entry:', error);
      }
    }
  }, [user]);

  // Get an entry by ID
  const getEntryById = useCallback(
    (id: string) => entries.find(entry => entry.id === id) || null,
    [entries]
  );

  // Get entries for a specific time period
  const getEntriesByTimePeriod = useCallback(
    (startDate: Date, endDate: Date) => {
      return entries.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= startDate && entryDate <= endDate;
      });
    },
    [entries]
  );

  // Calculate mood distribution
  const getMoodDistribution = useCallback(() => {
    const distribution = {
      joy: 0,
      calm: 0,
      neutral: 0,
      sad: 0,
      stress: 0,
      unknown: 0,
    };

    entries.forEach(entry => {
      if (entry.mood) {
        distribution[entry.mood]++;
      } else {
        distribution.unknown++;
      }
    });

    return distribution;
  }, [entries]);

  return {
    entries,
    isLoading,
    addEntry,
    updateEntry,
    deleteEntry,
    getEntryById,
    getEntriesByTimePeriod,
    getMoodDistribution,
  };
};

export default useJournalEntries;
