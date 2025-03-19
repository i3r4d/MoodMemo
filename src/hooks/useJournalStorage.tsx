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
const STORAGE_PREFERENCE_KEY = 'moodmemo_local_storage_only';

export const useJournalStorage = () => {
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
      fetchCloudEntries().then(cloudEntries => {
        if (cloudEntries.length > 0) {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cloudEntries));
          setEntries(cloudEntries);
          toast({
            title: 'Local Storage Enabled',
            description: 'Your entries will now be stored only on this device.',
          });
        }
      });
    }
    // If toggling from local to cloud and user is premium, sync local to cloud
    else if (!value && user && isPremium) {
      const localEntries = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
      if (localEntries.length > 0) {
        syncLocalToCloud(localEntries).then(() => {
          toast({
            title: 'Cloud Storage Enabled',
            description: 'Your entries will now be synced across all your devices.',
          });
          loadEntries();
        });
      }
    }
  }, [user, isPremium]);

  // Fetch entries from Supabase
  const fetchCloudEntries = useCallback(async () => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('id, text, audio_url, timestamp, mood')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false });
      
      if (error) {
        console.error('Error fetching journal entries:', error);
        return [];
      }
      
      return data.map(entry => ({
        id: entry.id,
        text: entry.text,
        audioUrl: entry.audio_url,
        timestamp: entry.timestamp,
        mood: entry.mood as JournalEntry['mood'],
      }));
    } catch (error) {
      console.error('Error in fetchCloudEntries:', error);
      return [];
    }
  }, [user]);

  // Sync local entries to cloud
  const syncLocalToCloud = useCallback(async (localEntries: JournalEntry[]) => {
    if (!user || !isPremium) return;
    
    try {
      for (const entry of localEntries) {
        await supabase
          .from('journal_entries')
          .upsert({
            id: entry.id,
            user_id: user.id,
            text: entry.text,
            audio_url: entry.audioUrl,
            timestamp: entry.timestamp,
            mood: entry.mood,
          });
      }
    } catch (error) {
      console.error('Error syncing to cloud:', error);
    }
  }, [user, isPremium]);

  // Load entries based on storage preference and premium status
  const loadEntries = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Load from local storage if preference is set or user is not premium
      if (localStorageOnly || !user || !isPremium) {
        try {
          const savedEntries = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (savedEntries) {
            setEntries(JSON.parse(savedEntries));
          } else {
            setEntries([]);
          }
        } catch (error) {
          console.error('Error loading journal entries from local storage:', error);
          setEntries([]);
        }
      } 
      // Otherwise load from cloud for premium users
      else if (user && isPremium && !localStorageOnly) {
        const cloudEntries = await fetchCloudEntries();
        setEntries(cloudEntries);
      }
    } catch (error) {
      console.error('Error in loadEntries:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, isPremium, localStorageOnly, fetchCloudEntries]);

  // Initial load of entries
  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // Save entries to local storage for free users or if localStorageOnly is true
  useEffect(() => {
    if (!isLoading && (!user || !isPremium || localStorageOnly)) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(entries));
    }
  }, [entries, isLoading, user, isPremium, localStorageOnly]);

  // Add a new entry
  const addEntry = useCallback(async (entry: Omit<JournalEntry, 'id'>) => {
    try {
      if (user && isPremium && !localStorageOnly) {
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
        // Free user or localStorageOnly: save to local storage
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
  }, [user, isPremium, localStorageOnly, toast]);

  // Delete an entry
  const deleteEntry = useCallback(async (id: string) => {
    try {
      if (user && isPremium && !localStorageOnly) {
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
  }, [user, isPremium, localStorageOnly, toast]);

  return {
    entries,
    isLoading,
    addEntry,
    deleteEntry,
    isPremiumStorage: !!(user && isPremium && !localStorageOnly),
    localStorageOnly,
    toggleStoragePreference
  };
};
