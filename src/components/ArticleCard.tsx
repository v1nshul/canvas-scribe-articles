import React, { useState, useRef, useEffect } from "react";
import { Article, Tool } from "@/types";
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
  const cardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Handle dragging with proper mouse offset tracking
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
  
  // Mouse move handler for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !cardRef.current) return;
      
      const parentRect = cardRef.current.parentElement?.getBoundingClientRect();
      if (!parentRect) return;
      
      // Calculate new position based on mouse position minus the drag offset
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

  // Handle resizing - support both right edge and bottom-right corner
  const handleResizeMouseDown = (e: React.MouseEvent, type: "e" | "se") => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(type);
  };
  
  // Mouse move handler for resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !cardRef.current) return;
      
      const rect = cardRef.current.getBoundingClientRect();
      
      if (isResizing === "e" || isResizing === "se") {
        // Horizontal resize
        const newWidth = Math.max(250, e.clientX - rect.left);
        onUpdate({
          ...article,
          size: { ...article.size, width: newWidth }
        });
      }
      
      if (isResizing === "se") {
        // Vertical resize
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

  // Toggle minimized state
  const toggleMinimized = () => {
    onUpdate({
      ...article,
      minimized: !article.minimized
    });
  };

  return (
    <div
      ref={cardRef}
      className={`absolute bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden flex flex-col transition-shadow ${
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
      {/* Header - Draggable */}
      <div
        className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 flex items-center gap-2 cursor-move hover:from-blue-600 hover:to-blue-700 transition-all flex-shrink-0"
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

      {/* Content */}
      {!article.minimized && (
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto p-4 text-sm leading-relaxed"
          style={{
            minHeight: "200px"
          }}
        >
          {article.isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="inline-block w-8 h-8 border-3 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-2" />
                <p className="text-gray-500">Loading article...</p>
              </div>
            </div>
          ) : article.error ? (
            <div className="text-red-500 text-center p-4 bg-red-50 rounded">
              <p className="font-semibold">Error</p>
              <p className="text-xs">{article.error}</p>
            </div>
          ) : article.content ? (
            <div
              className="prose prose-sm max-w-full"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          ) : (
            <div className="text-gray-400 text-center">
              No content available
            </div>
          )}
        </div>
      )}

      {/* Resize Handles */}
      {!article.minimized && (
        <>
          {/* Right edge resize */}
          <div
            className="absolute top-0 right-0 w-1 h-full cursor-ew-resize hover:bg-blue-400 hover:w-2 transition-all"
            onMouseDown={(e) => handleResizeMouseDown(e, "e")}
            title="Drag to resize width"
          />
          
          {/* Bottom-right corner resize */}
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
