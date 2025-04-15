
import { Button } from "@/components/ui/button";

interface ToolbarProps {
  activeTool: "move" | "pan" | "highlight" | "note" | "select";
  onChangeTool: (tool: "move" | "pan" | "highlight" | "note" | "select") => void;
}

const Toolbar = ({ activeTool, onChangeTool }: ToolbarProps) => {
  return (
    <div className="p-2 border-b border-gray-200 flex gap-2">
      <div className="flex flex-wrap gap-1">
        <Button
          size="sm"
          variant={activeTool === "move" ? "default" : "outline"}
          onClick={() => onChangeTool("move")}
          className="flex items-center"
        >
          <span className="mr-1">↔</span> Move Articles
        </Button>
        
        <Button
          size="sm"
          variant={activeTool === "select" ? "default" : "outline"}
          onClick={() => onChangeTool("select")}
          className="flex items-center"
        >
          <span className="mr-1">👆</span> Select/Edit
        </Button>
        
        <Button
          size="sm"
          variant={activeTool === "pan" ? "default" : "outline"}
          onClick={() => onChangeTool("pan")}
          className="flex items-center"
        >
          <span className="mr-1">✋</span> Pan Canvas
        </Button>
        
        <Button
          size="sm"
          variant={activeTool === "highlight" ? "default" : "outline"}
          onClick={() => onChangeTool("highlight")}
          className="flex items-center"
        >
          <span className="mr-1">🖍</span> Highlight Text
        </Button>
        
        <Button
          size="sm"
          variant={activeTool === "note" ? "default" : "outline"}
          onClick={() => onChangeTool("note")}
          className="flex items-center"
        >
          <span className="mr-1">📝</span> Add Notes
        </Button>
      </div>
    </div>
  );
};

export default Toolbar;
