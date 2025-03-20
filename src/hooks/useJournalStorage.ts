import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface JournalEntry {
  id: string;
  text: string;
  mood: 'happy' | 'neutral' | 'sad';
  moodIntensity?: number;
  tags?: string[];
  formatting?: {
    bold: boolean;
    italic: boolean;
    list: boolean;
  };
  timestamp: string;
  userId: string;
}

export const useJournalStorage = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user]);

  const fetchEntries = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user?.id)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addEntry = async (entry: Omit<JournalEntry, 'id' | 'userId'>) => {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .insert([
          {
            ...entry,
            user_id: user?.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      setEntries(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error adding entry:', error);
      throw error;
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
      setEntries(prev => prev.filter(entry => entry.id !== id));
    } catch (error) {
      console.error('Error deleting entry:', error);
      throw error;
    }
  };

  const updateEntry = async (id: string, updates: Partial<JournalEntry>) => {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      setEntries(prev =>
        prev.map(entry => (entry.id === id ? data : entry))
      );
      return data;
    } catch (error) {
      console.error('Error updating entry:', error);
      throw error;
    }
  };

  const getEntriesByDateRange = async (startDate: Date, endDate: Date) => {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user?.id)
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString())
        .order('timestamp', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching entries by date range:', error);
      throw error;
    }
  };

  const getEntriesByTag = async (tag: string) => {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user?.id)
        .contains('tags', [tag])
        .order('timestamp', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching entries by tag:', error);
      throw error;
    }
  };

  return {
    entries,
    isLoading,
    addEntry,
    deleteEntry,
    updateEntry,
    getEntriesByDateRange,
    getEntriesByTag,
  };
}; 