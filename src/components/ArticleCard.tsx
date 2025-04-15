
import React, { useState, useRef, useEffect } from "react";
import { Article, Highlight, Tool } from "@/types";
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
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Handle dragging - Updated to follow mouse pointer directly
  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTool !== "move") return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Set dragging state
    setIsDragging(true);
  };
  
  // Handle mouse movement for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      // Calculate new position based on mouse position
      const newX = Math.round((e.clientX - 200) / 20) * 20; // 200 is half the article width
      const newY = Math.round((e.clientY - 40) / 20) * 20; // 40 accounts for header height
      
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
  }, [isDragging, article, onUpdate]);

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
  
  // Update size on mouse move during resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
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
  }, [isResizing, dragOffset, article, onUpdate]);
  
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
      const newHighlight = {
        id: `highlight_${Date.now()}`,
        text: highlightedText,
        color: "yellow",
        position: {
          start: 0,
          end: 0
        }
      };
      
      // Add the highlight to the article (for state tracking)
      const updatedHighlights = article.highlights ? [...article.highlights, newHighlight] : [newHighlight];
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
    
    const noteId = `note_${Date.now()}`;
    const noteElement = document.createElement('div');
    noteElement.id = noteId;
    noteElement.className = 'sticky-note group';
    noteElement.style.cssText = `
      position: absolute;
      left: ${noteX}px;
      top: ${noteY}px;
      z-index: 5;
      width: 150px;
      min-height: 75px;
      padding: 8px;
      background-color: #fff59d;
      border: 1px solid #ffeb3b;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border-radius: 4px;
      font-size: 0.875rem;
    `;
    
    // Add delete button
    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '✕';
    deleteButton.className = 'absolute top-1 right-1 opacity-100 text-gray-600 hover:text-red-500';
    deleteButton.style.cssText = `
      background: none;
      border: none;
      cursor: pointer;
      padding: 2px;
      font-size: 12px;
    `;
    
    deleteButton.onclick = (e) => {
      e.stopPropagation();
      noteElement.remove();
    };
    
    noteElement.appendChild(deleteButton);
    
    const noteContent = document.createElement('div');
    noteContent.contentEditable = 'true';
    noteContent.textContent = "Click to edit";
    noteContent.style.marginTop = '15px';
    
    noteElement.appendChild(noteContent);
    contentRef.current.appendChild(noteElement);
    
    // Make note draggable only when using select tool or note tool
    let isNoteDragging = false;
    let startX: number;
    let startY: number;
    
    noteElement.onmousedown = (e) => {
      // Fix: Correct comparison with the Tool type
      if (activeTool !== "select" && activeTool !== "note") return;
      if (e.target === deleteButton || e.target === noteContent) return;
      
      isNoteDragging = true;
      startX = e.clientX - noteElement.offsetLeft;
      startY = e.clientY - noteElement.offsetTop;
      e.stopPropagation();
      
      // Prevent note from detaching during drag
      e.preventDefault();
    };
    
    const noteMoveHandler = (e: MouseEvent) => {
      if (!isNoteDragging) return;
      noteElement.style.left = `${e.clientX - startX}px`;
      noteElement.style.top = `${e.clientY - startY}px`;
    };
    
    const noteUpHandler = () => {
      isNoteDragging = false;
    };
    
    // Attach the event listeners directly to the document
    document.addEventListener('mousemove', noteMoveHandler);
    document.addEventListener('mouseup', noteUpHandler);
    
    // Ensure note content doesn't trigger card dragging
    noteContent.addEventListener('mousedown', (e) => {
      e.stopPropagation();
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
