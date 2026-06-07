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
  const [zoomLevel, setZoomLevel] = useState(1);

  // Handle zoom with mouse wheel (Ctrl/Cmd + scroll)
  const handleZoom = useCallback((e: WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return;
    
    e.preventDefault();
    
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Adjust zoom level
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.min(Math.max(0.5, zoomLevel + delta), 3);
    const zoomChange = newZoom / zoomLevel;
    
    // Keep the point under the cursor stationary
    setViewOffset(prev => ({
      x: mouseX - (mouseX - prev.x) * zoomChange,
      y: mouseY - (mouseY - prev.y) * zoomChange
    }));
    
    setZoomLevel(newZoom);
  }, [zoomLevel]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener("wheel", handleZoom, { passive: false });
    }
    return () => {
      if (canvas) {
        canvas.removeEventListener("wheel", handleZoom);
      }
    };
  }, [handleZoom]);

  // Handle canvas panning with the pan tool
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
      className="flex-1 overflow-hidden relative bg-gradient-to-br from-gray-50 to-gray-100"
      onMouseDown={handleMouseDown}
      style={{
        cursor:
          activeTool === "pan"
            ? isPanning
              ? "grabbing"
              : "grab"
            : activeTool === "select"
            ? "pointer"
            : activeTool === "move"
            ? "move"
            : activeTool === "highlight"
            ? "text"
            : activeTool === "note"
            ? "crosshair"
            : "default"
      }}
    >
      {/* Grid Background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, #d1d1d1 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
          transform: `translate(${viewOffset.x}px, ${viewOffset.y}px)`,
          opacity: 0.6
        }}
      />

      {/* Articles Container */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translate(${viewOffset.x}px, ${viewOffset.y}px) scale(${zoomLevel})`,
          transformOrigin: "0 0"
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

        {/* Empty State */}
        {articles.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white bg-opacity-90 backdrop-blur px-8 py-12 rounded-xl shadow-lg text-center max-w-md">
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                Your canvas is empty
              </h3>
              <p className="text-gray-600 mb-2">
                Add an article from the sidebar to get started
              </p>
              <p className="text-xs text-gray-500">
                💡 Use the Move tool to drag, Pan to navigate, or Ctrl+Scroll to zoom
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Zoom & Pan Indicator */}
      <div className="absolute bottom-4 right-4 bg-white bg-opacity-80 backdrop-blur px-3 py-2 rounded text-xs text-gray-600 pointer-events-none">
        <div>
          <span className="font-semibold">Zoom:</span> {(zoomLevel * 100).toFixed(0)}%
        </div>
        <div className="text-gray-500 text-xs mt-1">
          Ctrl+Scroll to zoom | Pan tool to navigate
        </div>
      </div>
    </div>
  );
};

export default CanvasWorkspace;
