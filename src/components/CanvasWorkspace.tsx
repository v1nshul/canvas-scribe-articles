
import { useState, useRef, useEffect, useCallback } from "react";
import { Article, Tool } from "@/types";
import ArticleCard from "./ArticleCard";

interface CanvasWorkspaceProps {
  articles: Article[];
  onUpdateArticle: (article: Article) => void;
  onDeleteArticle: (id: string) => void;
  activeTool: Tool;
}

const CanvasWorkspace = ({ 
  articles, 
  onUpdateArticle, 
  onDeleteArticle,
  activeTool
}: CanvasWorkspaceProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });
  
  // Add zoom functionality
  const [zoomLevel, setZoomLevel] = useState(1);
  
  const handleZoom = useCallback((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      setZoomLevel(prev => Math.min(Math.max(0.5, prev + delta), 2));
    }
  }, []);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('wheel', handleZoom, { passive: false });
    }
    return () => {
      if (canvas) {
        canvas.removeEventListener('wheel', handleZoom);
      }
    };
  }, [handleZoom]);
  
  // Handle canvas panning with the hand tool
  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTool !== "pan") return;
    
    e.preventDefault();
    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
  };
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isPanning) return;
      
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      
      setViewOffset(prev => ({
        x: prev.x + dx,
        y: prev.y + dy
      }));
      
      setPanStart({ x: e.clientX, y: e.clientY });
    };
    
    const handleMouseUp = () => {
      setIsPanning(false);
    };
    
    if (isPanning) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
    
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isPanning, panStart]);
  
  return (
    <div 
      ref={canvasRef}
      className="flex-1 overflow-hidden relative bg-gray-50"
      onMouseDown={handleMouseDown}
      style={{ 
        cursor: activeTool === "pan" ? "grab" : 
                activeTool === "select" ? "pointer" :
                activeTool === "move" ? "move" :
                activeTool === "highlight" ? "text" :
                activeTool === "note" ? "crosshair" : "default"
      }}
    >
      {/* Grid Background */}
      <div 
        className="absolute inset-0 bg-grid-pattern"
        style={{
          backgroundImage: "radial-gradient(circle, #d1d1d1 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          transform: `translate(${viewOffset.x}px, ${viewOffset.y}px)`,
        }}
      />
      
      {/* Articles Layer */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translate(${viewOffset.x}px, ${viewOffset.y}px) scale(${zoomLevel})`,
          transformOrigin: "0 0",
        }}
      >
        {articles.map(article => (
          <div key={article.id} className="pointer-events-auto">
            <ArticleCard
              article={article}
              onUpdate={onUpdateArticle}
              onDelete={onDeleteArticle}
              activeTool={activeTool}
            />
          </div>
        ))}
        
        {/* Empty state message */}
        {articles.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white bg-opacity-80 p-6 rounded-lg shadow-sm text-center">
              <h3 className="text-xl font-medium mb-2">Your canvas is empty</h3>
              <p className="text-gray-600 mb-4">Add an article from the sidebar to get started</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CanvasWorkspace;
