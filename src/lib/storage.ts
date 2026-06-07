import { Article } from "@/types";

const STORAGE_KEY = "canvas-scribe-articles";
const STORAGE_VERSION = 1;

export interface StorageData {
  version: number;
  articles: Article[];
  savedAt: string;
}

export const StorageManager = {
  save: (articles: Article[]): boolean => {
    try {
      const data: StorageData = {
        version: STORAGE_VERSION,
        articles,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
      return false;
    }
  },

  load: (): Article[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];

      const data: StorageData = JSON.parse(stored);
      
      if (data.version !== STORAGE_VERSION) {
        console.warn("Storage version mismatch, starting fresh");
        return [];
      }

      return data.articles || [];
    } catch (error) {
      console.error("Failed to load from localStorage:", error);
      return [];
    }
  },

  clear: (): boolean => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error("Failed to clear localStorage:", error);
      return false;
    }
  },

  getSavedAt: (): string | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const data: StorageData = JSON.parse(stored);
      return data.savedAt;
    } catch {
      return null;
    }
  }
};
