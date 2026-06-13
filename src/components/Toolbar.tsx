
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/contexts/ThemeContext";
import { ChevronLeft, ChevronRight, Moon, Sun } from "lucide-react";

interface ToolbarProps {
  activeTool: "move" | "pan" | "highlight" | "note" | "select" | "container";
  onChangeTool: (tool: "move" | "pan" | "highlight" | "note" | "select" | "container") => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const Toolbar = ({ activeTool, onChangeTool, isSidebarOpen, onToggleSidebar }: ToolbarProps) => {
  const { theme, toggleTheme } = useTheme();

  const tools = [
    { id: "move" as const, label: "Move", description: "Drag articles" },
    { id: "pan" as const, label: "Pan", description: "Navigate canvas" },
    { id: "container" as const, label: "Container", description: "Group articles" },
    { id: "note" as const, label: "Notes", description: "Add notes on canvas" },
  ];

  return (
    <div className="border-b border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 flex items-center gap-3 shadow-sm">
      <Button
        size="icon"
        variant="outline"
        onClick={onToggleSidebar}
        className="dark:text-white dark:hover:bg-zinc-700"
        title={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
      >
        {isSidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </Button>

      <Separator orientation="vertical" className="h-6" />

      <div className="flex gap-2">
        {tools.map(tool => (
          <Button
            key={tool.id}
            size="sm"
            variant="outline"
            onClick={() => onChangeTool(tool.id)}
            className={`transition-colors font-medium tracking-tight dark:text-white ${
              activeTool === tool.id 
                ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100" 
                : "hover:bg-gray-50 dark:hover:bg-zinc-700"
            }`}
            title={tool.description}
          >
            <span className="text-xs">{tool.label}</span>
          </Button>
        ))}
      </div>
      
      <Separator orientation="vertical" className="h-6" />
      
      <div className="text-xs text-gray-600 dark:text-gray-400 ml-auto">
        <span className="font-semibold">Ctrl+Scroll</span> to zoom
      </div>

      <Separator orientation="vertical" className="h-6" />

      <Button
        size="icon"
        variant="outline"
        onClick={toggleTheme}
        className="dark:text-white dark:hover:bg-zinc-700"
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? (
          <Moon size={18} />
        ) : (
          <Sun size={18} />
        )}
      </Button>
    </div>
  );
};

export default Toolbar;
