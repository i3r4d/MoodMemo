
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/components/ui/use-toast';
import { JournalEntry, MoodType } from '@/types/journal';

const LOCAL_STORAGE_KEY = 'moodmemo_journal_entries';
const STORAGE_PREFERENCE_KEY = 'moodmemo_local_storage_only';

interface SupabaseJournalEntry {
  id: string;
  text: string;
  audio_url: string | null;
  timestamp: string;
  mood: MoodType | null;
  mood_intensity?: number;
  tags?: string[];
  template?: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
  encrypted?: boolean;
  formatting?: {
    bold: boolean;
    italic: boolean;
    list: boolean;
  };
}

// Convert Supabase data format to our app's JournalEntry format
const mapSupabaseToJournalEntry = (entry: SupabaseJournalEntry): JournalEntry => {
  return {
    id: entry.id,
    text: entry.text,
    audioUrl: entry.audio_url,
    timestamp: entry.timestamp,
    mood: entry.mood,
    moodIntensity: entry.mood_intensity,
    tags: entry.tags || [],
    template: entry.template,
    userId: entry.user_id,
    user_id: entry.user_id,
    formatting: entry.formatting || { bold: false, italic: false, list: false }
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

  const toggleStoragePreference = useCallback((value: boolean) => {
    setLocalStorageOnly(value);
    localStorage.setItem(STORAGE_PREFERENCE_KEY, value.toString());
    
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
    } else if (!value && user && isPremium) {
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

  const fetchCloudEntries = useCallback(async () => {
    if (!user) return [];
    
    try {
      console.log('Fetching cloud entries for user:', user.id);
      const { data, error } = await supabase
        .from('journal_entries')
        .select('id, text, audio_url, timestamp, mood, mood_intensity, tags, template, user_id')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false });
      
      if (error) {
        console.error('Error fetching journal entries:', error);
        return [];
      }
      
      console.log('Fetched entries from Supabase:', data);
      return (data || []).map(mapSupabaseToJournalEntry);
    } catch (error) {
      console.error('Error in fetchCloudEntries:', error);
      return [];
    }
  }, [user]);

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
            mood_intensity: entry.moodIntensity,
            tags: entry.tags,
            template: entry.template
          });
      }
    } catch (error) {
      console.error('Error syncing to cloud:', error);
    }
  }, [user, isPremium]);

  const loadEntries = useCallback(async () => {
    setIsLoading(true);
    
    try {
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
      } else if (user && isPremium && !localStorageOnly) {
        const cloudEntries = await fetchCloudEntries();
        setEntries(cloudEntries);
      }
    } catch (error) {
      console.error('Error in loadEntries:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, isPremium, localStorageOnly, fetchCloudEntries]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  useEffect(() => {
    if (!isLoading && (!user || !isPremium || localStorageOnly)) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(entries));
    }
  }, [entries, isLoading, user, isPremium, localStorageOnly]);

  const addEntry = useCallback(async (entry: Omit<JournalEntry, 'id' | 'userId' | 'user_id'>) => {
    try {
      console.log('Adding journal entry:', entry);
      
      if (user && isPremium && !localStorageOnly) {
        const { data, error } = await supabase
          .from('journal_entries')
          .insert({
            user_id: user.id,
            text: entry.text,
            audio_url: entry.audioUrl,
            timestamp: entry.timestamp,
            mood: entry.mood,
            mood_intensity: entry.moodIntensity,
            tags: entry.tags || [],
            template: entry.template
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
        
        const newEntry = mapSupabaseToJournalEntry(data);
        console.log('Added journal entry to Supabase:', newEntry);
        setEntries(prev => [newEntry, ...prev]);
        return newEntry.id;
      } else {
        // Free user or localStorageOnly: save to local storage
        const newEntry: JournalEntry = {
          ...entry,
          id: uuidv4(),
          tags: entry.tags || [],
          userId: user?.id,
          user_id: user?.id
        };
        
        console.log('Added journal entry to local storage:', newEntry);
        setEntries(prev => [newEntry, ...prev]);
        return newEntry.id;
      }
    } catch (error) {
      console.error('Error in addEntry:', error);
      return null;
    }
  }, [user, isPremium, localStorageOnly, toast]);

  const deleteEntry = useCallback(async (id: string) => {
    try {
      if (user && isPremium && !localStorageOnly) {
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
      
      setEntries(prev => prev.filter(entry => entry.id !== id));
    } catch (error) {
      console.error('Error in deleteEntry:', error);
    }
  }, [user, isPremium, localStorageOnly, toast]);

  const updateEntry = useCallback(async (id: string, updates: Partial<JournalEntry>) => {
    try {
      if (user && isPremium && !localStorageOnly) {
        const supabaseUpdates = {
          text: updates.text,
          audio_url: updates.audioUrl,
          mood: updates.mood,
          mood_intensity: updates.moodIntensity,
          tags: updates.tags,
          template: updates.template
        };
        
        const { data, error } = await supabase
          .from('journal_entries')
          .update(supabaseUpdates)
          .eq('id', id)
          .eq('user_id', user.id)
          .select()
          .single();
        
        if (error) throw error;
        
        const updatedEntry = mapSupabaseToJournalEntry(data);
        setEntries(prev => prev.map(entry => entry.id === id ? updatedEntry : entry));
        return updatedEntry;
      } else {
        const updatedEntry = { ...entries.find(e => e.id === id), ...updates };
        setEntries(prev => prev.map(entry => entry.id === id ? updatedEntry : entry));
        return updatedEntry;
      }
    } catch (error) {
      console.error('Error updating entry:', error);
      throw error;
    }
  }, [entries, user, isPremium, localStorageOnly]);

  return {
    entries,
    isLoading,
    addEntry,
    deleteEntry,
    updateEntry,
    isPremiumStorage: !!(user && isPremium && !localStorageOnly),
    localStorageOnly,
    toggleStoragePreference
  };
};

export default useJournalStorage;
