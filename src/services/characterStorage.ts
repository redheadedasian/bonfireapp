import { StateStorage } from 'zustand/middleware';

const DB_NAME = 'bonfire_app_storage_db';
const DB_VERSION = 1;
const STORE_NAME = 'keyval';

let idbPromise: Promise<IDBDatabase> | null = null;

function getIDB(): Promise<IDBDatabase> {
  if (idbPromise) return idbPromise;
  idbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return idbPromise;
}

async function idbGet(key: string): Promise<string | null> {
  try {
    const db = await getIDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function idbSet(key: string, value: string): Promise<void> {
  try {
    const db = await getIDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch {
    // In-memory fallback or silent failure
  }
}

async function idbRemove(key: string): Promise<void> {
  try {
    const db = await getIDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch {
    // Silent
  }
}

// In-memory fallback if all persistent storage fails
const memoryStore: Record<string, string> = {};

/**
 * Strips huge base64 images from JSON payload if localStorage quota is exceeded
 */
function createTrimmedPayload(value: string): string {
  try {
    const parsed = JSON.parse(value);
    if (parsed?.state?.character) {
      const char = parsed.state.character;
      // If heroUrl or portraitUrl are huge data URLs, strip them from the localStorage copy
      // (The full version remains safe in IndexedDB)
      if (char.heroUrl && typeof char.heroUrl === 'string' && char.heroUrl.startsWith('data:') && char.heroUrl.length > 50000) {
        char.heroUrl = '';
      }
      if (char.portraitUrl && typeof char.portraitUrl === 'string' && char.portraitUrl.startsWith('data:') && char.portraitUrl.length > 50000) {
        char.portraitUrl = '';
      }
    }
    return JSON.stringify(parsed);
  } catch {
    return value;
  }
}

/**
 * Clean up obsolete keys from localStorage to reclaim space
 */
function cleanupOldLocalStorageKeys() {
  try {
    const obsoletePrefixes = ['bonfire-character-storage-v1', 'bonfire-character-storage', 'bonfire-character-backup'];
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && obsoletePrefixes.some(p => k === p || k.startsWith(p + '-'))) {
        localStorage.removeItem(k);
      }
    }
  } catch {
    // ignore
  }
}

export const safeCharacterStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    // 1. Try to read from IndexedDB first for full fidelity
    try {
      const idbVal = await idbGet(name);
      if (idbVal) {
        const sanitized = idbVal.replace(/"species":\s*"Lolth-Sworn Drow"/g, '"species":"Mountain Dwarf"');
        return sanitized;
      }
    } catch {
      // Fall through to localStorage
    }

    // 2. Try localStorage
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const localVal = window.localStorage.getItem(name);
        if (localVal) {
          const sanitized = localVal.replace(/"species":\s*"Lolth-Sworn Drow"/g, '"species":"Mountain Dwarf"');
          // Backup to IndexedDB in background
          idbSet(name, sanitized).catch(() => {});
          return sanitized;
        }
      }
    } catch {
      // Fall through to memory
    }

    return memoryStore[name] ?? null;
  },

  setItem: async (name: string, value: string): Promise<void> => {
    // 1. Always save to in-memory store
    memoryStore[name] = value;

    // 2. Persist full data to IndexedDB (virtually unlimited quota)
    await idbSet(name, value);

    // 3. Attempt to save to localStorage for fast synchronous reloads
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(name, value);
      }
    } catch (err: any) {
      // Check if QuotaExceededError
      const isQuotaError = 
        err?.name === 'QuotaExceededError' ||
        err?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        err?.code === 22 ||
        err?.code === 1014 ||
        (typeof err?.message === 'string' && err.message.toLowerCase().includes('quota'));

      if (isQuotaError) {
        try {
          // Clean up old keys
          cleanupOldLocalStorageKeys();

          // Try trimmed payload without large base64 image strings
          const trimmed = createTrimmedPayload(value);
          window.localStorage.setItem(name, trimmed);
        } catch {
          // If still failing, gracefully rely on IndexedDB + in-memory store without throwing
          console.warn('[SafeStorage] localStorage quota exceeded; full state preserved in IndexedDB.');
        }
      } else {
        console.warn('[SafeStorage] localStorage setItem failed:', err);
      }
    }
  },

  removeItem: async (name: string): Promise<void> => {
    delete memoryStore[name];
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(name);
      }
    } catch {
      // Ignore
    }
    await idbRemove(name);
  },
};
