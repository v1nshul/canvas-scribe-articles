
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface ToolbarProps {
  activeTool: "move" | "pan" | "highlight" | "note" | "select";
  onChangeTool: (tool: "move" | "pan" | "highlight" | "note" | "select") => void;
}

const Toolbar = ({ activeTool, onChangeTool }: ToolbarProps) => {
  const tools = [
    { id: "move" as const, label: "Move", icon: "⬌", description: "Drag articles around" },
    { id: "select" as const, label: "Select", icon: "👆", description: "Edit & interact" },
    { id: "pan" as const, label: "Pan", icon: "✋", description: "Navigate canvas" },
    { id: "highlight" as const, label: "Highlight", icon: "🖍️", description: "Mark text" },
    { id: "note" as const, label: "Note", icon: "📝", description: "Add sticky notes" },
  ];

  return (
    <div className="border-b border-gray-200 bg-white px-4 py-3 flex items-center gap-3 shadow-sm">
      <div className="flex gap-2">
        {tools.map(tool => (
          <Button
            key={tool.id}
            size="sm"
            variant={activeTool === tool.id ? "default" : "outline"}
            onClick={() => onChangeTool(tool.id)}
            className={`flex items-center gap-2 transition-all ${
              activeTool === tool.id 
                ? "bg-gradient-to-r from-blue-500 to-indigo-500 border-transparent" 
                : "hover:bg-gray-50"
            }`}
            title={tool.description}
          >
            <span>{tool.icon}</span>
            <span className="text-xs font-medium">{tool.label}</span>
          </Button>
        ))}
      </div>
      
      <Separator orientation="vertical" className="h-6" />
      
      <div className="text-xs text-gray-600 ml-auto">
        <span className="font-semibold">Tip:</span> Ctrl+Scroll to zoom | Use Pan tool to navigate
      </div>
    </div>
  );
};

export default Toolbar;
