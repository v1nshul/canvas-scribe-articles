
import React, { useState, useRef, useEffect } from "react";
import { Article, Highlight, Note } from "@/types";
import { Button } from "@/components/ui/button";

interface ArticleCardProps {
  article: Article;
  onUpdate: (article: Article) => void;
  onDelete: (id: string) => void;
  activeTool: "move" | "pan" | "highlight" | "note";
}

const ArticleCard = ({ article, onUpdate, onDelete, activeTool }: ArticleCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTool !== "move") return;
    
    e.preventDefault();
    setIsDragging(true);
    
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };
  
  // Handle resizing
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX,
        y: rect.width
      });
    }
  };
  
  // Update position or size on mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        // Calculate new position
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        
        // Snap to grid (20px)
        const snappedX = Math.round(newX / 20) * 20;
        const snappedY = Math.round(newY / 20) * 20;
        
        onUpdate({
          ...article,
          position: { x: snappedX, y: snappedY }
        });
      } else if (isResizing) {
        // Calculate new width
        const newWidth = dragOffset.y + (e.clientX - dragOffset.x);
        // Snap to grid (20px)
        const snappedWidth = Math.max(300, Math.round(newWidth / 20) * 20);
        
        onUpdate({
          ...article,
          size: { ...article.size, width: snappedWidth }
        });
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };
    
    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
    
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, article, onUpdate]);
  
  // Toggle minimized state
  const toggleMinimized = () => {
    onUpdate({
      ...article,
      minimized: !article.minimized
    });
  };
  
  // Handle highlighting
  const handleHighlight = () => {
    if (activeTool !== "highlight" || !contentRef.current) return;
    
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.toString().trim()) return;
    
    const range = selection.getRangeAt(0);
    const highlightedText = selection.toString();
    
    try {
      // Create span element for highlighting
      const highlightSpan = document.createElement('span');
      highlightSpan.className = 'highlight';
      highlightSpan.title = 'Highlighted text';
      highlightSpan.style.backgroundColor = 'rgba(255, 255, 0, 0.4)';
      
      // Replace the selected text with highlighted version
      range.surroundContents(highlightSpan);
      
      // Add remove option on right-click
      highlightSpan.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (confirm('Remove this highlight?')) {
          // Replace the highlight with its text content
          const textNode = document.createTextNode(highlightSpan.textContent || '');
          highlightSpan.parentNode?.replaceChild(textNode, highlightSpan);
        }
      });
      
      // Create a new highlight object for our state
      const newHighlight: Highlight = {
        id: `highlight_${Date.now()}`,
        text: highlightedText,
        color: "yellow",
        position: {
          start: 0,
          end: 0
        }
      };
      
      // Add the highlight to the article (for state tracking)
      const updatedHighlights = [...(article.highlights || []), newHighlight];
      onUpdate({
        ...article,
        highlights: updatedHighlights
      });
      
      // Visual feedback animation
      highlightSpan.animate(
        [
          { backgroundColor: 'rgba(255, 255, 0, 0.8)' },
          { backgroundColor: 'rgba(255, 255, 0, 0.4)' }
        ],
        { duration: 500 }
      );
    } catch (e) {
      console.error("Error highlighting text:", e);
    }
    
    // Clear the selection
    selection.removeAllRanges();
  };
  
  // Handle adding a note
  const handleAddNote = (e: React.MouseEvent) => {
    if (activeTool !== "note" || !contentRef.current) return;
    
    const rect = contentRef.current.getBoundingClientRect();
    const noteX = e.clientX - rect.left;
    const noteY = e.clientY - rect.top;
    
    // Create a new note
    const newNote: Note = {
      id: `note_${Date.now()}`,
      text: "Click to edit this note",
      color: "yellow",
      position: {
        x: noteX,
        y: noteY
      }
    };
    
    // Add the note to the article
    const updatedNotes = [...(article.notes || []), newNote];
    onUpdate({
      ...article,
      notes: updatedNotes
    });
    
    // Create the note element directly
    const noteElement = document.createElement('div');
    noteElement.className = 'sticky-note sticky-note-yellow';
    noteElement.style.position = 'absolute';
    noteElement.style.left = `${noteX}px`;
    noteElement.style.top = `${noteY}px`;
    noteElement.style.zIndex = '5';
    noteElement.style.width = '150px';
    noteElement.style.minHeight = '75px';
    noteElement.style.padding = '8px';
    noteElement.style.backgroundColor = '#fff59d';
    noteElement.style.border = '1px solid #ffeb3b';
    noteElement.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    noteElement.style.borderRadius = '4px';
    noteElement.style.fontSize = '0.875rem';
    noteElement.contentEditable = 'true';
    noteElement.textContent = "Click to edit this note";
    
    // Add it to the article content
    contentRef.current.appendChild(noteElement);
    
    // Make it draggable without relying on activeTool
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;
    
    noteElement.addEventListener('mousedown', (e: MouseEvent) => {
      // Make notes always draggable regardless of the current tool
      isDragging = true;
      offsetX = e.clientX - noteElement.getBoundingClientRect().left;
      offsetY = e.clientY - noteElement.getBoundingClientRect().top;
      e.stopPropagation();
    });
    
    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const newX = e.clientX - offsetX - contentRef.current!.getBoundingClientRect().left;
        const newY = e.clientY - offsetY - contentRef.current!.getBoundingClientRect().top;
        noteElement.style.left = `${newX}px`;
        noteElement.style.top = `${newY}px`;
      }
    });
    
    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  };
  
  return (
    <div
      ref={cardRef}
      className={`absolute bg-white border border-gray-200 rounded-md shadow-md overflow-hidden ${
        activeTool === "move" ? "cursor-move" : ""
      }`}
      style={{
        left: `${article.position.x}px`,
        top: `${article.position.y}px`,
        width: `${article.size.width}px`,
        height: article.minimized ? "auto" : `${article.size.height}px`,
        zIndex: isDragging || isResizing ? 10 : 1
      }}
    >
      {/* Article Header */}
      <div 
        className="bg-gray-100 p-2 border-b border-gray-200 flex items-center"
        onMouseDown={handleMouseDown}
      >
        <div className="mr-1 text-gray-500">
          <span className="text-xs">⋮⋮</span>
        </div>
        <h3 className="text-sm font-medium flex-1 mr-2 truncate" title={article.title}>
          {article.title}
        </h3>
        <div className="flex space-x-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={toggleMinimized}
          >
            {article.minimized ? (
              <span className="text-xs">□</span>
            ) : (
              <span className="text-xs">_</span>
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 text-red-500 hover:text-red-700"
            onClick={() => onDelete(article.id)}
          >
            <span className="text-xs">✕</span>
          </Button>
        </div>
      </div>
      
      {/* Article Content */}
      {!article.minimized && (
        <div 
          ref={contentRef}
          className="p-4 overflow-y-auto h-[calc(100%-40px)]"
          onMouseUp={handleHighlight}
          onClick={handleAddNote}
        >
          {article.isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : article.content ? (
            <div 
              className="prose max-w-full"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          ) : (
            <div className="text-gray-500 text-center">
              No content available
            </div>
          )}
          
          {/* Notes are now created dynamically and don't need to be rendered here */}
        </div>
      )}
      
      {/* Resize handle */}
      {!article.minimized && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-ew-resize"
          onMouseDown={handleResizeMouseDown}
        />
      )}
    </div>
  );
};

export default ArticleCard;
