
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/contexts/ThemeContext";
import { ChevronLeft, ChevronRight, Circle, Diamond, Hand, Moon, Square, Sun } from "lucide-react";

interface ToolbarProps {
  activeTool: "move" | "pan" | "highlight" | "note" | "select" | "container";
  onChangeTool: (tool: "move" | "pan" | "highlight" | "note" | "select" | "container") => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const Toolbar = ({ activeTool, onChangeTool, isSidebarOpen, onToggleSidebar }: ToolbarProps) => {
  const { theme, toggleTheme } = useTheme();

  const tools = [
    { id: "move" as const, icon: Diamond, description: "Move tool" },
    { id: "pan" as const, icon: Hand, description: "Pan tool" },
    { id: "container" as const, icon: Square, description: "Container tool" },
    { id: "note" as const, icon: Circle, description: "Notes tool" },
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
            size="icon"
            variant="outline"
            onClick={() => onChangeTool(tool.id)}
            className={`transition-colors font-medium tracking-tight dark:text-white ${
              activeTool === tool.id 
                ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100" 
                : "hover:bg-gray-50 dark:hover:bg-zinc-700"
            }`}
            title={tool.description}
          >
            <tool.icon size={16} />
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
