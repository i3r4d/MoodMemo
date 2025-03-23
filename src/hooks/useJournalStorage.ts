
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';
import { JournalEntry, MoodType } from '@/types/journal';

const LOCAL_STORAGE_KEY = 'moodmemo_journal_entries';
const STORAGE_PREFERENCE_KEY = 'moodmemo_local_storage_only';

interface SupabaseJournalEntry {
  id: string;
  text: string;
  audio_url: string | null;
  timestamp: string;
  mood: MoodType | null;
  tags?: string[];
  user_id: string;
}

const mapSupabaseToJournalEntry = (entry: SupabaseJournalEntry): JournalEntry => {
  return {
    id: entry.id,
    text: entry.text,
    audioUrl: entry.audio_url,
    timestamp: entry.timestamp,
    mood: entry.mood,
    tags: entry.tags || [],
    userId: entry.user_id,
    user_id: entry.user_id
  };
};

const useJournalStorage = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [localStorageOnly, setLocalStorageOnly] = useState(() => {
    const preference = localStorage.getItem(STORAGE_PREFERENCE_KEY);
    return preference ? preference === 'true' : false;
  });
  const { user, isPremium } = useAuth();
  const { toast } = useToast();

  // Toggle storage preference
  const toggleStoragePreference = useCallback((value: boolean) => {
    setLocalStorageOnly(value);
    localStorage.setItem(STORAGE_PREFERENCE_KEY, value.toString());
    
    // If toggling from cloud to local only, sync cloud data to local
    if (value && user && isPremium) {
      // Just load the data again with the updated preference
      loadEntries();
      toast({
        title: 'Local Storage Enabled',
        description: 'Your entries will now be stored only on this device.',
      });
    }
    // If toggling from local to cloud and user is premium, sync local to cloud
    else if (!value && user && isPremium) {
      // We'll sync on next save operation
      toast({
        title: 'Cloud Storage Enabled',
        description: 'Your entries will now be synced across all your devices.',
      });
      loadEntries();
    }
  }, [user, isPremium]);

  // Load entries from localStorage or Supabase on mount
  const loadEntries = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Loading entries, user:', user);
      
      // Try to load from local storage first as a fallback
      const savedEntries = localStorage.getItem(LOCAL_STORAGE_KEY);
      let parsedEntries: JournalEntry[] = [];
      
      if (savedEntries) {
        try {
          parsedEntries = JSON.parse(savedEntries);
          console.log('Loaded entries from localStorage:', parsedEntries);
        } catch (e) {
          console.error('Error parsing localStorage entries:', e);
        }
      }
      
      if (user && isPremium && !localStorageOnly) {
        // Try to load from Supabase
        console.log('Attempting to load entries from Supabase for user:', user.id);
        const { data, error } = await supabase
          .from('journal_entries')
          .select('id, text, audio_url, timestamp, mood, tags, user_id')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false });
        
        if (error) {
          console.error('Error loading entries from Supabase:', error);
          // Use local storage entries as fallback
          setEntries(parsedEntries);
        } else if (data && data.length > 0) {
          console.log('Loaded entries from Supabase:', data);
          
          // Format the data - ensure each entry has all required properties including user_id
          const formattedEntries = data.map(entry => mapSupabaseToJournalEntry(entry as SupabaseJournalEntry));
          setEntries(formattedEntries);
          
          // Update local storage with the latest data
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formattedEntries));
        } else {
          console.log('No entries found in Supabase, using localStorage');
          setEntries(parsedEntries);
        }
      } else {
        // If not logged in, load from localStorage
        console.log('User not logged in or using local storage only, using localStorage entries');
        setEntries(parsedEntries);
      }
    } catch (error) {
      console.error('Error loading journal entries:', error);
      // Try localStorage as last resort
      try {
        const savedEntries = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedEntries) {
          setEntries(JSON.parse(savedEntries));
        }
      } catch (e) {
        console.error('Final error loading from localStorage:', e);
        setEntries([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, isPremium, localStorageOnly]);

  // Initial load of entries
  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // Save entries to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      console.log('Saving entries to localStorage:', entries);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(entries));
    }
  }, [entries, isLoading]);

  // Add a new entry
  const addEntry = useCallback(async (entry: Omit<JournalEntry, 'id'>) => {
    try {
      console.log('Adding new entry:', entry);
      const newId = uuidv4();
      const newEntry: JournalEntry = {
        ...entry,
        id: newId,
        tags: entry.tags || []
      };

      // Add to local state first for immediate UI update
      setEntries(prevEntries => {
        console.log('Previous entries:', prevEntries);
        const updatedEntries = [newEntry, ...prevEntries];
        console.log('Updated entries:', updatedEntries);
        return updatedEntries;
      });

      // If user is authenticated, also save to Supabase
      if (user && isPremium && !localStorageOnly) {
        try {
          console.log('Saving entry to Supabase for user:', user.id);
          const { error } = await supabase
            .from('journal_entries')
            .insert([{
              id: newId,
              user_id: user.id,
              text: entry.text,
              audio_url: entry.audioUrl,
              timestamp: entry.timestamp,
              mood: entry.mood,
              tags: entry.tags || []
            }]);
          
          if (error) {
            console.error('Error saving journal entry to Supabase:', error);
            toast({
              title: "Save Error",
              description: "Your entry was saved locally but failed to sync to the cloud.",
              variant: "destructive",
            });
          } else {
            console.log('Entry saved successfully to Supabase');
            toast({
              title: "Entry Saved",
              description: "Your journal entry has been saved successfully.",
              variant: "default",
            });
          }
        } catch (error) {
          console.error('Exception in saving to Supabase:', error);
        }
      } else {
        console.log('User not authenticated or using local storage only, entry saved only locally');
        toast({
          title: "Entry Saved",
          description: "Your journal entry has been saved locally.",
          variant: "default",
        });
      }

      return newId;
    } catch (error) {
      console.error('Error in add entry:', error);
      toast({
        title: "Error",
        description: "Failed to save your journal entry. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  }, [user, isPremium, localStorageOnly, toast]);

  // Delete an entry
  const deleteEntry = useCallback(async (id: string) => {
    console.log('Deleting entry:', id);
    
    // Update local state first
    setEntries(prevEntries => {
      const filtered = prevEntries.filter(entry => entry.id !== id);
      console.log('Entries after deletion:', filtered);
      return filtered;
    });

    // If user is authenticated, also delete from Supabase
    if (user && isPremium && !localStorageOnly) {
      try {
        const { error } = await supabase
          .from('journal_entries')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
        
        if (error) {
          console.error('Error deleting journal entry:', error);
          toast({
            title: "Delete Error",
            description: "Your entry was deleted locally but failed to sync to the cloud.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Entry Deleted",
            description: "Your journal entry has been deleted.",
            variant: "default",
          });
        }
      } catch (error) {
        console.error('Error in delete entry:', error);
      }
    }
  }, [user, isPremium, localStorageOnly, toast]);

  return {
    entries,
    isLoading,
    addEntry,
    deleteEntry,
    localStorageOnly,
    toggleStoragePreference
  };
};

export default useJournalStorage;
