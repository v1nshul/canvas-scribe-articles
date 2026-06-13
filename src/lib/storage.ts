import { Article, CanvasNote, Container } from "@/types";

const STORAGE_KEY = "canvas-scribe-articles";
const STORAGE_VERSION = 1;

export interface StorageData {
  version: number;
  articles: Article[];
  canvasNotes: CanvasNote[];
  containers: Container[];
  savedAt: string;
}

export const StorageManager = {
  save: (articles: Article[], canvasNotes: CanvasNote[], containers: Container[]): boolean => {
    try {
      const data: StorageData = {
        version: STORAGE_VERSION,
        articles,
        canvasNotes,
        containers,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
      return false;
    }
  },

  load: (): { articles: Article[]; canvasNotes: CanvasNote[]; containers: Container[] } => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return { articles: [], canvasNotes: [], containers: [] };

      const data = JSON.parse(stored) as Partial<StorageData>;
      
      if (data.version !== STORAGE_VERSION) {
        console.warn("Storage version mismatch, starting fresh");
        return { articles: [], canvasNotes: [], containers: [] };
      }

      return {
        articles: data.articles || [],
        canvasNotes: data.canvasNotes || [],
        containers: data.containers || []
      };
    } catch (error) {
      console.error("Failed to load from localStorage:", error);
      return { articles: [], canvasNotes: [], containers: [] };
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
