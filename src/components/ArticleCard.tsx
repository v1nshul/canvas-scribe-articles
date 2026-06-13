import React, { useState, useRef, useEffect } from "react";
import { Article, Tool } from "@/types";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ArticleCardProps {
  article: Article;
  onUpdate: (article: Article) => void;
  onDelete: (id: string) => void;
  activeTool: Tool;
  zoomLevel: number;
}

const ArticleCard = ({ article, onUpdate, onDelete, activeTool, zoomLevel }: ArticleCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<false | "e" | "se">(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  
  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if (activeTool !== "move") return;
    if (!cardRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = cardRef.current.getBoundingClientRect();
    setDragStart({
      x: (e.clientX - rect.left) / zoomLevel,
      y: (e.clientY - rect.top) / zoomLevel
    });
    setIsDragging(true);
  };
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !cardRef.current) return;
      
      const parentRect = cardRef.current.parentElement?.getBoundingClientRect();
      if (!parentRect) return;
      
      const newX = (e.clientX - parentRect.left) / zoomLevel - dragStart.x;
      const newY = (e.clientY - parentRect.top) / zoomLevel - dragStart.y;
      
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
  }, [isDragging, dragStart, article, onUpdate, zoomLevel]);

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
        const newWidth = Math.max(250, (e.clientX - rect.left) / zoomLevel);
        onUpdate({
          ...article,
          size: { ...article.size, width: newWidth }
        });
      }
      
      if (isResizing === "se") {
        const newHeight = Math.max(200, (e.clientY - rect.top) / zoomLevel);
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
  }, [isResizing, article, onUpdate, zoomLevel]);

  const toggleMinimized = () => {
    onUpdate({
      ...article,
      minimized: !article.minimized
    });
  };

  return (
    <div
      ref={cardRef}
      className={`absolute bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg shadow-lg overflow-hidden flex flex-col transition-shadow ${
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
        className="bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 px-3 py-2 flex items-center gap-2 cursor-move flex-shrink-0"
        onMouseDown={handleHeaderMouseDown}
      >
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate" title={article.title}>
            {article.isLoading ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
                Loading...
              </span>
            ) : (
              article.title
            )}
          </h3>
        </div>
        
        <div className="flex gap-1 flex-shrink-0">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
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
            className="h-7 w-7 text-zinc-600 dark:text-zinc-300 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
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
          className="flex-1 overflow-y-auto p-4 text-sm leading-relaxed relative bg-white dark:bg-zinc-900"
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
