import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface OfflineEntry {
  id: string;
  content: string;
  mood: string;
  tags: string[];
  createdAt: string;
  syncStatus: 'pending' | 'synced';
  audioUrl?: string;
  encrypted?: boolean;
}

export function useOfflineStorage() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingEntries, setPendingEntries] = useState<OfflineEntry[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  // Initialize IndexedDB
  useEffect(() => {
    const initDB = async () => {
      try {
        const db = await openIndexedDB();
        await loadPendingEntries(db);
      } catch (error) {
        console.error('Error initializing IndexedDB:', error);
        toast({
          title: 'Storage Error',
          description: 'Failed to initialize offline storage.',
          variant: 'destructive',
        });
      }
    };

    initDB();
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingEntries();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: 'Offline Mode',
        description: 'You are currently offline. Changes will sync when you reconnect.',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Open IndexedDB connection
  const openIndexedDB = useCallback(() => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('MoodMemoDB', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('journalEntries')) {
          const store = db.createObjectStore('journalEntries', { keyPath: 'id' });
          store.createIndex('syncStatus', 'syncStatus', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }

        if (!db.objectStoreNames.contains('auth')) {
          db.createObjectStore('auth', { keyPath: 'key' });
        }
      };
    });
  }, []);

  // Load pending entries from IndexedDB
  const loadPendingEntries = useCallback(async (db: IDBDatabase) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['journalEntries'], 'readonly');
      const store = transaction.objectStore('journalEntries');
      const index = store.index('syncStatus');
      const request = index.getAll('pending');

      request.onsuccess = () => {
        setPendingEntries(request.result);
        resolve(request.result);
      };

      request.onerror = () => reject(request.error);
    });
  }, []);

  // Save entry to IndexedDB
  const saveEntry = useCallback(async (entry: Omit<OfflineEntry, 'id' | 'syncStatus'>) => {
    try {
      const db = await openIndexedDB();
      const newEntry: OfflineEntry = {
        ...entry,
        id: crypto.randomUUID(),
        syncStatus: 'pending',
      };

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['journalEntries'], 'readwrite');
        const store = transaction.objectStore('journalEntries');
        const request = store.add(newEntry);

        request.onsuccess = () => {
          setPendingEntries(prev => [...prev, newEntry]);
          resolve(newEntry);
        };

        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error saving entry:', error);
      throw error;
    }
  }, [openIndexedDB]);

  // Sync pending entries with the server
  const syncPendingEntries = useCallback(async () => {
    if (!isOnline || isSyncing || !user) return;

    setIsSyncing(true);
    try {
      const db = await openIndexedDB();
      const entries = await loadPendingEntries(db);

      for (const entry of entries) {
        try {
          // Upload audio file if exists
          let audioUrl = entry.audioUrl;
          if (entry.audioUrl && entry.audioUrl.startsWith('blob:')) {
            const audioBlob = await fetch(entry.audioUrl).then(r => r.blob());
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('audio')
              .upload(`${user.id}/${entry.id}.mp3`, audioBlob);

            if (uploadError) throw uploadError;
            audioUrl = uploadData.path;
          }

          // Save entry to Supabase
          const { error: saveError } = await supabase
            .from('journal_entries')
            .insert({
              id: entry.id,
              user_id: user.id,
              content: entry.content,
              mood: entry.mood,
              tags: entry.tags,
              created_at: entry.createdAt,
              audio_url: audioUrl,
              encrypted: entry.encrypted,
            });

          if (saveError) throw saveError;

          // Mark entry as synced
          const transaction = db.transaction(['journalEntries'], 'readwrite');
          const store = transaction.objectStore('journalEntries');
          const request = store.get(entry.id);

          request.onsuccess = () => {
            const syncedEntry = request.result;
            syncedEntry.syncStatus = 'synced';
            store.put(syncedEntry);
          };

          setPendingEntries(prev => prev.filter(e => e.id !== entry.id));
        } catch (error) {
          console.error('Error syncing entry:', error);
          toast({
            title: 'Sync Error',
            description: 'Failed to sync some entries. They will be retried later.',
            variant: 'destructive',
          });
        }
      }

      toast({
        title: 'Sync Complete',
        description: 'All offline entries have been synced successfully.',
      });
    } catch (error) {
      console.error('Error in sync process:', error);
      toast({
        title: 'Sync Error',
        description: 'Failed to sync offline entries. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, user, openIndexedDB, loadPendingEntries, toast]);

  // Get all entries (both synced and pending)
  const getAllEntries = useCallback(async () => {
    try {
      const db = await openIndexedDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['journalEntries'], 'readonly');
        const store = transaction.objectStore('journalEntries');
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting entries:', error);
      throw error;
    }
  }, [openIndexedDB]);

  // Delete entry
  const deleteEntry = useCallback(async (id: string) => {
    try {
      const db = await openIndexedDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['journalEntries'], 'readwrite');
        const store = transaction.objectStore('journalEntries');
        const request = store.delete(id);

        request.onsuccess = () => {
          setPendingEntries(prev => prev.filter(e => e.id !== id));
          resolve(true);
        };

        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error deleting entry:', error);
      throw error;
    }
  }, [openIndexedDB]);

  return {
    isOnline,
    isSyncing,
    pendingEntries,
    saveEntry,
    getAllEntries,
    deleteEntry,
    syncPendingEntries,
  };
} 