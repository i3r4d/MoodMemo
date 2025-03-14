
import { useState, useEffect, useCallback } from 'react';

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

  // Load entries from localStorage on mount
  useEffect(() => {
    const loadEntries = () => {
      try {
        const savedEntries = localStorage.getItem(STORAGE_KEY);
        if (savedEntries) {
          setEntries(JSON.parse(savedEntries));
        }
      } catch (error) {
        console.error('Error loading journal entries:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEntries();
  }, []);

  // Save entries to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    }
  }, [entries, isLoading]);

  // Add a new entry
  const addEntry = useCallback((entry: Omit<JournalEntry, 'id'>) => {
    const newEntry: JournalEntry = {
      ...entry,
      id: Date.now().toString(),
    };

    setEntries(prevEntries => [newEntry, ...prevEntries]);
    return newEntry.id;
  }, []);

  // Update an existing entry
  const updateEntry = useCallback((id: string, updatedFields: Partial<JournalEntry>) => {
    setEntries(prevEntries =>
      prevEntries.map(entry =>
        entry.id === id ? { ...entry, ...updatedFields } : entry
      )
    );
  }, []);

  // Delete an entry
  const deleteEntry = useCallback((id: string) => {
    setEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
  }, []);

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
