
import { useState, useEffect } from "react";
import { Tool } from "@/types";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ToolbarProps {
  activeTool: Tool;
  onChangeTool: (tool: Tool) => void;
}

const Toolbar = ({ activeTool, onChangeTool }: ToolbarProps) => {
  const [shortcutsVisible, setShortcutsVisible] = useState(false);
  
  const tools = [
    { id: "move" as Tool, icon: "✥", label: "Move Articles", shortcut: "M" },
    { id: "pan" as Tool, icon: "✋", label: "Pan Canvas", shortcut: "P" },
    { id: "highlight" as Tool, icon: "✎", label: "Highlight Text", shortcut: "H" },
    { id: "note" as Tool, icon: "📝", label: "Add Notes", shortcut: "N" },
  ];
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if not in an input, textarea, etc.
      if (e.target instanceof HTMLElement) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
          return;
        }
      }
      
      const key = e.key.toUpperCase();
      
      if (key === 'M') onChangeTool('move');
      else if (key === 'P') onChangeTool('pan');
      else if (key === 'H') onChangeTool('highlight');
      else if (key === 'N') onChangeTool('note');
      else if (key === '?') setShortcutsVisible(prev => !prev);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onChangeTool]);
  
  useEffect(() => {
    // Change cursor based on active tool
    document.body.style.cursor = 
      activeTool === "pan" ? "grab" : 
      activeTool === "highlight" ? "text" :
      activeTool === "note" ? "cell" : "default";
    
    return () => {
      document.body.style.cursor = "default";
    };
  }, [activeTool]);

  return (
    <div className="h-14 border-b border-gray-200 flex items-center px-4 bg-white">
      <div className="mr-4 font-medium">Tools:</div>
      <div className="flex space-x-2">
        <TooltipProvider>
          {tools.map((tool) => (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant={activeTool === tool.id ? "default" : "outline"}
                  onClick={() => onChangeTool(tool.id)}
                  className="h-10 w-10"
                >
                  <span className="text-lg">{tool.icon}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{tool.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
      <div className="ml-auto text-sm text-gray-500 flex items-center">
        <span className="inline-block mr-1">◫</span> Grid: 20px
        <Button 
          variant="ghost" 
          size="sm" 
          className="ml-4 text-sm"
          onClick={() => setShortcutsVisible(prev => !prev)}
        >
          ?
        </Button>
      </div>
      
      {/* Keyboard shortcuts */}
      {shortcutsVisible && (
        <div className="absolute top-16 right-4 bg-white shadow-md border border-gray-200 rounded-md p-4 z-50 text-sm">
          <h4 className="font-bold mb-2">Keyboard Shortcuts</h4>
          <ul className="space-y-1">
            {tools.map(tool => (
              <li key={tool.id} className="flex justify-between">
                <span>{tool.label}</span>
                <span className="ml-4 font-mono bg-gray-100 px-1 rounded">{tool.shortcut}</span>
              </li>
            ))}
            <li className="flex justify-between">
              <span>Toggle Shortcuts</span>
              <span className="ml-4 font-mono bg-gray-100 px-1 rounded">?</span>
            </li>
            <li className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Ctrl/⌘ + Scroll</span>
              <span className="ml-4">Zoom</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Toolbar;
