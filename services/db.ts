import { DrawingProject } from '../types';

const DB_NAME = 'ASCIIverseDB';
const DB_VERSION = 1;
const STORE_DRAWINGS = 'drawings';

// --- LocalStorage Wrapper ---
export const LocalStore = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("LocalStore set error", e);
    }
  }
};

// --- IndexedDB Wrapper ---
export const IDB = {
  open: (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_DRAWINGS)) {
          db.createObjectStore(STORE_DRAWINGS, { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  },

  saveDrawing: async (project: Omit<DrawingProject, 'id'> | DrawingProject): Promise<number> => {
    const db = await IDB.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_DRAWINGS, 'readwrite');
      const store = tx.objectStore(STORE_DRAWINGS);
      const request = store.put({ ...project, updatedAt: Date.now() });
      
      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  },

  getAllDrawings: async (): Promise<DrawingProject[]> => {
    const db = await IDB.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_DRAWINGS, 'readonly');
      const store = tx.objectStore(STORE_DRAWINGS);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  deleteDrawing: async (id: number): Promise<void> => {
    const db = await IDB.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_DRAWINGS, 'readwrite');
      const store = tx.objectStore(STORE_DRAWINGS);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
};
