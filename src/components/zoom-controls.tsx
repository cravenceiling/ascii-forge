import {
  Download,
  Grid3x3,
  Redo2,
  RotateCcw,
  Undo2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onExport: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  showGrid?: boolean;
  onToggleGrid?: () => void;
}

export function ZoomControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onExport,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  showGrid = false,
  onToggleGrid,
}: ZoomControlsProps) {
  const zoomPercentage = Math.round(zoom * 100);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/95 px-1.5 py-1 shadow-lg backdrop-blur-sm">
        {onUndo && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8",
              canUndo
                ? "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                : "text-zinc-600",
            )}
            onClick={onUndo}
            disabled={!canUndo}
          >
            <Undo2 className="h-4 w-4" />
            <span className="sr-only">Undo</span>
          </Button>
        )}
        {onRedo && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8",
              canRedo
                ? "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                : "text-zinc-600",
            )}
            onClick={onRedo}
            disabled={!canRedo}
          >
            <Redo2 className="h-4 w-4" />
            <span className="sr-only">Redo</span>
          </Button>
        )}
        {onToggleGrid && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8",
              showGrid
                ? "bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200",
            )}
            onClick={onToggleGrid}
          >
            <Grid3x3 className="h-4 w-4" />
            <span className="sr-only">Toggle grid</span>
          </Button>
        )}
      </div>

      <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/95 px-1.5 py-1 shadow-lg backdrop-blur-sm">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
          onClick={onZoomOut}
        >
          <ZoomOut className="h-4 w-4" />
          <span className="sr-only">Zoom out</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 min-w-[60px] px-2 text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
          onClick={onZoomReset}
        >
          {zoomPercentage}%
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
          onClick={onZoomIn}
        >
          <ZoomIn className="h-4 w-4" />
          <span className="sr-only">Zoom in</span>
        </Button>
      </div>

      <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/95 px-1.5 py-1 shadow-lg backdrop-blur-sm">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
          onClick={onZoomReset}
        >
          <RotateCcw className="h-4 w-4" />
          <span className="sr-only">Reset view</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
          onClick={onExport}
        >
          <Download className="h-4 w-4" />
          <span className="sr-only">Export</span>
        </Button>
      </div>
    </div>
  );
}
