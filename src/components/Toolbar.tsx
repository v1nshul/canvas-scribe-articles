
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";

interface ToolbarProps {
  activeTool: "move" | "pan" | "highlight" | "note" | "select" | "container";
  onChangeTool: (tool: "move" | "pan" | "highlight" | "note" | "select" | "container") => void;
}

const Toolbar = ({ activeTool, onChangeTool }: ToolbarProps) => {
  const { theme, toggleTheme } = useTheme();

  const tools = [
    { id: "move" as const, label: "Move", icon: "⬌", description: "Drag articles" },
    { id: "pan" as const, label: "Pan", icon: "✋", description: "Navigate canvas" },
    { id: "container" as const, label: "Container", icon: "▭", description: "Group articles" },
    { id: "note" as const, label: "Note", icon: "📝", description: "Add sticky notes" },
  ];

  return (
    <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 flex items-center gap-3 shadow-sm">
      <div className="flex gap-2">
        {tools.map(tool => (
          <Button
            key={tool.id}
            size="sm"
            variant={activeTool === tool.id ? "default" : "outline"}
            onClick={() => onChangeTool(tool.id)}
            className={`flex items-center gap-2 transition-all dark:text-white ${
              activeTool === tool.id 
                ? "bg-gradient-to-r from-blue-500 to-indigo-500 border-transparent dark:from-blue-700 dark:to-indigo-700" 
                : "hover:bg-gray-50 dark:hover:bg-slate-700"
            }`}
            title={tool.description}
          >
            <span>{tool.icon}</span>
            <span className="text-xs font-medium">{tool.label}</span>
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
        className="dark:text-white dark:hover:bg-slate-700"
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
