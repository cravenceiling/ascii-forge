import type { ToolType } from "@/types";
import { TOOLS } from "@/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  MousePointer2,
  Square,
  Minus,
  ArrowRight,
  Type,
  Eraser,
} from "lucide-react";

const iconMap = {
  MousePointer2,
  Square,
  Minus,
  ArrowRight,
  Type,
  Eraser,
};

interface ToolbarProps {
  currentTool: ToolType;
  onToolChange: (tool: ToolType) => void;
}

export function Toolbar({ currentTool, onToolChange }: ToolbarProps) {
  return (
    <TooltipProvider delay={200}>
      <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/95 px-2 py-1.5 shadow-lg backdrop-blur-sm">
        {TOOLS.map((tool) => {
          const Icon = iconMap[tool.icon as keyof typeof iconMap];
          const isActive = currentTool === tool.type;

          return (
            <Tooltip key={tool.type}>
              <TooltipTrigger
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center rounded-md transition-all duration-200",
                  isActive
                    ? "bg-zinc-700 text-white shadow-inner"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                )}
                onClick={() => onToolChange(tool.type)}
              >
                <Icon className="h-4 w-4" />
                <span className="sr-only">
                  {tool.label} ({tool.shortcut})
                </span>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="flex items-center gap-2 border-zinc-800 bg-zinc-900 text-zinc-200"
              >
                <span>{tool.label}</span>
                <kbd className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-500">
                  {tool.shortcut}
                </kbd>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
