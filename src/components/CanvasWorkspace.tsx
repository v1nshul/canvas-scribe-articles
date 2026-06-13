import { useState, useRef, useEffect, useCallback } from "react";
import { Article, Tool, Container } from "@/types";
import ArticleCard from "./ArticleCard";

interface CanvasWorkspaceProps {
  articles: Article[];
  onUpdateArticle: (article: Article) => void;
  onDeleteArticle: (id: string) => void;
  activeTool: Tool;
}

interface CanvasNote {
  id: string;
  text: string;
  position: {
    x: number;
    y: number;
  };
  createdAt: number;
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
  const [containers, setContainers] = useState<Container[]>([]);
  const [notes, setNotes] = useState<CanvasNote[]>([]);
  const [draftContainer, setDraftContainer] = useState<Container | null>(null);
  const [isDrawingContainer, setIsDrawingContainer] = useState(false);
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });
  const [editingContainerId, setEditingContainerId] = useState<string | null>(null);
  const [containerLabel, setContainerLabel] = useState("");

  const handleZoom = useCallback((e: WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return;
    
    e.preventDefault();
    
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const zoomFactor = Math.exp(-e.deltaY * 0.0015);
    setZoomLevel((currentZoom) => {
      const newZoom = Math.min(Math.max(0.5, currentZoom * zoomFactor), 3);
      const zoomChange = newZoom / currentZoom;

      setViewOffset((prev) => ({
        x: mouseX - (mouseX - prev.x) * zoomChange,
        y: mouseY - (mouseY - prev.y) * zoomChange
      }));

      return newZoom;
    });
  }, []);

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

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    if (activeTool === "pan") {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    } else if (activeTool === "note") {
      if (target.closest("[data-canvas-item]") || target.closest("[data-note-ui]")) return;
      e.preventDefault();
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left - viewOffset.x) / zoomLevel;
        const y = (e.clientY - rect.top - viewOffset.y) / zoomLevel;
        setNotes((prev) => [
          ...prev,
          {
            id: `note_${Date.now()}`,
            text: "",
            position: { x, y },
            createdAt: Date.now()
          }
        ]);
      }
    } else if (activeTool === "container") {
      e.preventDefault();
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        setIsDrawingContainer(true);
        const startX = (e.clientX - rect.left - viewOffset.x) / zoomLevel;
        const startY = (e.clientY - rect.top - viewOffset.y) / zoomLevel;
        setDrawStart({ x: startX, y: startY });
        setDraftContainer({
          id: "draft_container",
          label: "",
          position: { x: startX, y: startY },
          size: { width: 0, height: 0 },
          color: "#3b82f6",
          createdAt: 0
        });
      }
    }
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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDrawingContainer || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const currentX = (e.clientX - rect.left - viewOffset.x) / zoomLevel;
      const currentY = (e.clientY - rect.top - viewOffset.y) / zoomLevel;

      const width = Math.abs(currentX - drawStart.x);
      const height = Math.abs(currentY - drawStart.y);
      const x = Math.min(drawStart.x, currentX);
      const y = Math.min(drawStart.y, currentY);

      setDraftContainer((prev) =>
        prev
          ? {
              ...prev,
              position: { x, y },
              size: { width, height }
            }
          : prev
      );
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isDrawingContainer) {
        setIsDrawingContainer(false);
        setDraftContainer(null);
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          const currentX = (e.clientX - rect.left - viewOffset.x) / zoomLevel;
          const currentY = (e.clientY - rect.top - viewOffset.y) / zoomLevel;
          const width = Math.abs(currentX - drawStart.x);
          const height = Math.abs(currentY - drawStart.y);

          if (width > 50 && height > 50) {
            const newContainer: Container = {
              id: `container_${Date.now()}`,
              label: "Untitled Container",
              position: {
                x: Math.min(drawStart.x, currentX),
                y: Math.min(drawStart.y, currentY)
              },
              size: { width, height },
              color: "#3b82f6",
              createdAt: Date.now()
            };
            setEditingContainerId(newContainer.id);
            setContainerLabel(newContainer.label);
            setContainers(prev => [...prev, newContainer]);
          }
        }
      }
    };

    if (isDrawingContainer) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDrawingContainer, drawStart, viewOffset, zoomLevel]);

  const updateContainerLabel = (id: string, label: string) => {
    setContainers(prev =>
      prev.map(c => (c.id === id ? { ...c, label } : c))
    );
  };

  const deleteContainer = (id: string) => {
    setContainers(prev => prev.filter(c => c.id !== id));
  };

  const updateNote = (id: string, text: string) => {
    setNotes((prev) => prev.map((note) => (note.id === id ? { ...note, text } : note)));
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  };

  return (
    <div
      ref={canvasRef}
      className="flex-1 overflow-hidden relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-950 dark:to-slate-900"
      onMouseDown={handleCanvasMouseDown}
      style={{
        cursor:
          activeTool === "pan"
            ? isPanning
              ? "grabbing"
              : "grab"
            : activeTool === "container"
            ? "crosshair"
            : activeTool === "note"
            ? "cell"
            : "default"
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, #d1d1d1 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          transform: `translate(${viewOffset.x}px, ${viewOffset.y}px)`,
          opacity: 0.3,
          dark: {
            backgroundImage: "radial-gradient(circle at 1px 1px, #475569 1px, transparent 1px)"
          }
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translate(${viewOffset.x}px, ${viewOffset.y}px) scale(${zoomLevel})`,
          transformOrigin: "0 0"
        }}
      >
        {containers.map(container => (
          <div
            key={container.id}
            data-canvas-item
            className="absolute border-2 border-blue-400 dark:border-blue-500 rounded-lg pointer-events-auto group hover:shadow-lg transition-shadow"
            style={{
              left: `${container.position.x}px`,
              top: `${container.position.y}px`,
              width: `${container.size.width}px`,
              height: `${container.size.height}px`,
              backgroundColor: "rgba(59, 130, 246, 0.05)",
              zIndex: 5
            }}
          >
            <div className="absolute top-2 left-2 right-2 flex justify-between items-center">
              {editingContainerId === container.id ? (
                <input
                  autoFocus
                  type="text"
                  value={containerLabel}
                  onChange={(e) => setContainerLabel(e.target.value)}
                  onBlur={() => {
                    updateContainerLabel(container.id, containerLabel);
                    setEditingContainerId(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      updateContainerLabel(container.id, containerLabel);
                      setEditingContainerId(null);
                    }
                  }}
                  className="bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 text-xs px-2 py-1 rounded border border-blue-300 dark:border-blue-700 focus:outline-none"
                />
              ) : (
                <span
                  onClick={() => {
                    setEditingContainerId(container.id);
                    setContainerLabel(container.label);
                  }}
                  className="text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800"
                >
                  {container.label}
                </span>
              )}
              <button
                onClick={() => deleteContainer(container.id)}
                className="text-blue-400 dark:text-blue-500 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          </div>
        ))}

        {draftContainer && (
          <div
            data-canvas-item
            className="absolute border-2 border-dashed border-blue-400 dark:border-blue-500 rounded-lg pointer-events-none"
            style={{
              left: `${draftContainer.position.x}px`,
              top: `${draftContainer.position.y}px`,
              width: `${draftContainer.size.width}px`,
              height: `${draftContainer.size.height}px`,
              backgroundColor: "rgba(59, 130, 246, 0.08)",
              zIndex: 4
            }}
          />
        )}

        {notes.map((note) => (
          <div
            key={note.id}
            data-note-ui
            className="absolute pointer-events-auto bg-amber-100 dark:bg-amber-700 border border-amber-300 dark:border-amber-600 rounded-md shadow-md p-2 w-56"
            style={{
              left: `${note.position.x}px`,
              top: `${note.position.y}px`,
              zIndex: 25
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end mb-1">
              <button
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNote(note.id);
                }}
                className="text-amber-700 dark:text-amber-200 hover:text-red-600 dark:hover:text-red-300 text-xs"
                aria-label="Delete note"
              >
                ✕
              </button>
            </div>
            <textarea
              value={note.text}
              onMouseDown={(e) => e.stopPropagation()}
              onChange={(e) => updateNote(note.id, e.target.value)}
              placeholder="Write a note..."
              className="w-full h-24 resize-none bg-transparent text-sm text-amber-900 dark:text-amber-50 placeholder:text-amber-700 dark:placeholder:text-amber-200 outline-none"
            />
          </div>
        ))}

        {articles.map(article => (
          <div key={article.id} data-canvas-item className="pointer-events-auto">
            <ArticleCard
              article={article}
              onUpdate={onUpdateArticle}
              onDelete={onDeleteArticle}
              activeTool={activeTool}
              zoomLevel={zoomLevel}
            />
          </div>
        ))}

        {articles.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white dark:bg-slate-800 bg-opacity-90 dark:bg-opacity-90 backdrop-blur px-8 py-12 rounded-xl shadow-lg text-center max-w-md">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                Your canvas is empty
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Add an article from the sidebar to get started
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Use Move to drag, Pan to navigate, Container to group articles
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-4 right-4 bg-white dark:bg-slate-800 bg-opacity-80 dark:bg-opacity-80 backdrop-blur px-3 py-2 rounded text-xs text-gray-600 dark:text-gray-300 pointer-events-none">
        <div>
          <span className="font-semibold">Zoom:</span> {(zoomLevel * 100).toFixed(0)}%
        </div>
        <div className="text-gray-500 dark:text-gray-400 text-xs mt-1">
          Ctrl+Scroll to zoom | Pan tool to navigate
        </div>
      </div>
    </div>
  );
};

export default CanvasWorkspace;
