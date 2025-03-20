const CACHE_NAME = 'mood-memo-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});

// Fetch event - handle offline requests
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached response if found
        if (response) {
          return response;
        }

        // Clone the request because it can only be used once
        const fetchRequest = event.request.clone();

        // Make network request
        return fetch(fetchRequest)
          .then((response) => {
            // Check if response is valid
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response because it can only be used once
            const responseToCache = response.clone();

            // Cache the response
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
          });
      })
  );
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-journal-entries') {
    event.waitUntil(syncJournalEntries());
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'open',
        title: 'Open Journal'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Mood Memo', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Function to sync journal entries
async function syncJournalEntries() {
  try {
    const db = await openIndexedDB();
    const entries = await getAllPendingEntries(db);
    
    for (const entry of entries) {
      try {
        const response = await fetch('/api/journal-entries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await getAuthToken()}`
          },
          body: JSON.stringify(entry)
        });

        if (response.ok) {
          await markEntryAsSynced(db, entry.id);
        }
      } catch (error) {
        console.error('Error syncing entry:', error);
      }
    }
  } catch (error) {
    console.error('Error in sync process:', error);
  }
}

// IndexedDB setup
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MoodMemoDB', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object store for journal entries
      if (!db.objectStoreNames.contains('journalEntries')) {
        const store = db.createObjectStore('journalEntries', { keyPath: 'id' });
        store.createIndex('syncStatus', 'syncStatus', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
}

// Helper functions for IndexedDB operations
async function getAllPendingEntries(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['journalEntries'], 'readonly');
    const store = transaction.objectStore('journalEntries');
    const index = store.index('syncStatus');
    const request = index.getAll('pending');

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function markEntryAsSynced(db, entryId) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['journalEntries'], 'readwrite');
    const store = transaction.objectStore('journalEntries');
    const request = store.get(entryId);

    request.onsuccess = () => {
      const entry = request.result;
      entry.syncStatus = 'synced';
      store.put(entry);
    };

    request.onerror = () => reject(request.error);
  });
}

// Get auth token from IndexedDB
async function getAuthToken() {
  const db = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['auth'], 'readonly');
    const store = transaction.objectStore('auth');
    const request = store.get('token');

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
} 