import React, { useState, useRef, useEffect } from "react";
import { Article, Tool, Note } from "@/types";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ArticleCardProps {
  article: Article;
  onUpdate: (article: Article) => void;
  onDelete: (id: string) => void;
  activeTool: Tool;
}

const ArticleCard = ({ article, onUpdate, onDelete, activeTool }: ArticleCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<false | "e" | "se">(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if (activeTool !== "move") return;
    if (!cardRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = cardRef.current.getBoundingClientRect();
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
  };
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !cardRef.current) return;
      
      const parentRect = cardRef.current.parentElement?.getBoundingClientRect();
      if (!parentRect) return;
      
      const newX = e.clientX - parentRect.left - dragStart.x;
      const newY = e.clientY - parentRect.top - dragStart.y;
      
      onUpdate({
        ...article,
        position: { x: newX, y: newY }
      });
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
    
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart, article, onUpdate]);

  const handleResizeMouseDown = (e: React.MouseEvent, type: "e" | "se") => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(type);
  };
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !cardRef.current) return;
      
      const rect = cardRef.current.getBoundingClientRect();
      
      if (isResizing === "e" || isResizing === "se") {
        const newWidth = Math.max(250, e.clientX - rect.left);
        onUpdate({
          ...article,
          size: { ...article.size, width: newWidth }
        });
      }
      
      if (isResizing === "se") {
        const newHeight = Math.max(200, e.clientY - rect.top);
        onUpdate({
          ...article,
          size: { ...article.size, height: newHeight }
        });
      }
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
    };
    
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
    
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, article, onUpdate]);

  const toggleMinimized = () => {
    onUpdate({
      ...article,
      minimized: !article.minimized
    });
  };

  const addNote = (e: React.MouseEvent) => {
    if (activeTool !== "note" || !contentRef.current) return;
    
    const rect = contentRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newNote: Note = {
      id: `note_${Date.now()}`,
      articleId: article.id,
      text: "Click to edit note...",
      position: { x, y },
      createdAt: Date.now()
    };
    
    onUpdate({
      ...article,
      notes: [...article.notes, newNote]
    });
  };

  const updateNote = (noteId: string, text: string) => {
    onUpdate({
      ...article,
      notes: article.notes.map(note =>
        note.id === noteId ? { ...note, text } : note
      )
    });
  };

  const deleteNote = (noteId: string) => {
    onUpdate({
      ...article,
      notes: article.notes.filter(note => note.id !== noteId)
    });
  };

  return (
    <div
      ref={cardRef}
      className={`absolute bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden flex flex-col transition-shadow ${
        isDragging || isResizing ? "shadow-2xl border-blue-400" : "hover:shadow-xl"
      }`}
      style={{
        left: `${article.position.x}px`,
        top: `${article.position.y}px`,
        width: `${article.size.width}px`,
        height: article.minimized ? "auto" : `${article.size.height}px`,
        zIndex: isDragging || isResizing ? 50 : 10,
        cursor: activeTool === "move" ? "move" : "default"
      }}
    >
      <div
        className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800 px-4 py-3 flex items-center gap-2 cursor-move hover:from-blue-600 hover:to-blue-700 transition-all flex-shrink-0"
        onMouseDown={handleHeaderMouseDown}
      >
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white truncate" title={article.title}>
            {article.isLoading ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Loading...
              </span>
            ) : (
              article.title
            )}
          </h3>
          <p className="text-xs text-blue-100 truncate" title={article.url}>
            {article.url}
          </p>
        </div>
        
        <div className="flex gap-1 flex-shrink-0">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-white hover:bg-white hover:bg-opacity-20"
            onClick={(e) => {
              e.stopPropagation();
              toggleMinimized();
            }}
            title={article.minimized ? "Expand" : "Minimize"}
          >
            {article.minimized ? "□" : "−"}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-white hover:bg-red-500"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(article.id);
            }}
            title="Delete"
          >
            <X size={16} />
          </Button>
        </div>
      </div>

      {!article.minimized && (
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto p-4 text-sm leading-relaxed relative bg-white dark:bg-slate-900"
          onClick={addNote}
          style={{
            minHeight: "200px"
          }}
        >
          {article.isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="inline-block w-8 h-8 border-3 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-2" />
                <p className="text-gray-500 dark:text-gray-400">Loading article...</p>
              </div>
            </div>
          ) : article.error ? (
            <div className="text-red-500 dark:text-red-400 text-center p-4 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 rounded">
              <p className="font-semibold">Error</p>
              <p className="text-xs">{article.error}</p>
            </div>
          ) : article.content ? (
            <div
              className="prose prose-sm max-w-full dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          ) : (
            <div className="text-gray-400 dark:text-gray-500 text-center">
              No content available
            </div>
          )}

          {article.notes.map(note => (
            <div
              key={note.id}
              className="absolute bg-yellow-200 dark:bg-yellow-700 border-2 border-yellow-400 dark:border-yellow-600 rounded-lg p-3 shadow-md max-w-xs"
              style={{
                left: `${note.position.x}px`,
                top: `${note.position.y}px`,
                zIndex: 20,
                minWidth: "140px"
              }}
            >
              <div className="flex justify-between items-start gap-2 mb-2">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-900">Note</span>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="text-gray-600 dark:text-gray-900 hover:text-red-600 dark:hover:text-red-500 text-sm"
                >
                  ✕
                </button>
              </div>
              {editingNoteId === note.id ? (
                <textarea
                  value={note.text}
                  onChange={(e) => updateNote(note.id, e.target.value)}
                  onBlur={() => setEditingNoteId(null)}
                  className="w-full text-xs p-1 border border-yellow-400 dark:border-yellow-600 rounded bg-yellow-50 dark:bg-yellow-800 text-gray-900 dark:text-white focus:outline-none"
                  autoFocus
                />
              ) : (
                <p
                  onClick={() => setEditingNoteId(note.id)}
                  className="text-xs text-gray-800 dark:text-gray-900 cursor-pointer hover:bg-yellow-300 dark:hover:bg-yellow-600 p-1 rounded"
                >
                  {note.text}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {!article.minimized && (
        <>
          <div
            className="absolute top-0 right-0 w-1 h-full cursor-ew-resize hover:bg-blue-400 hover:w-2 transition-all"
            onMouseDown={(e) => handleResizeMouseDown(e, "e")}
            title="Drag to resize width"
          />
          
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize hover:bg-blue-400 transition-all"
            onMouseDown={(e) => handleResizeMouseDown(e, "se")}
            title="Drag to resize"
            style={{
              clipPath: "polygon(100% 0, 100% 100%, 0 100%)"
            }}
          />
        </>
      )}
    </div>
  );
};

export default ArticleCard;
