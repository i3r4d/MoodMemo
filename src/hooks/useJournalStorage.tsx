
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

const STORAGE_KEY = 'moodmemo_journal_storage_pref';

const useJournalStorage = () => {
  const [localStorageOnly, setLocalStorageOnly] = useState<boolean>(() => {
    const savedPref = localStorage.getItem(STORAGE_KEY);
    return savedPref ? JSON.parse(savedPref) : true;
  });
  const { user } = useAuth();

  // Save preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(localStorageOnly));
  }, [localStorageOnly]);

  // Toggle the storage preference
  const toggleStoragePreference = useCallback(() => {
    setLocalStorageOnly(prev => !prev);
  }, []);

  return {
    localStorageOnly,
    toggleStoragePreference
  };
};

export default useJournalStorage;
