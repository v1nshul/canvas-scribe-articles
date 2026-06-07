export interface Article {
  id: string;
  url: string;
  title: string;
  content: string;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  minimized: boolean;
  isLoading: boolean;
  error?: string;
  highlights: Highlight[];
  notes: Note[];
}

export interface Highlight {
  id: string;
  text: string;
  color: string;
  startOffset: number;
  endOffset: number;
}

export interface Note {
  id: string;
  text: string;
  position: {
    x: number;
    y: number;
  };
  createdAt: number;
}

export type Tool = "move" | "pan" | "highlight" | "note" | "select";
