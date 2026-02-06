import { useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Point, ViewState } from "@/types";
import { Check, X } from "lucide-react";

interface TextInputOverlayProps {
  position: Point | null;
  text: string;
  onTextChange: (text: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  viewState: ViewState;
  charWidth: number;
  charHeight: number;
}

export function TextInputOverlay({
  position,
  text,
  onTextChange,
  onSubmit,
  onCancel,
  viewState,
  charWidth,
  charHeight,
}: TextInputOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (position && inputRef.current) {
      inputRef.current.focus();
    }
  }, [position]);

  if (!position) return null;

  const style = {
    left: position.x * charWidth * viewState.zoom + viewState.offsetX,
    top: position.y * charHeight * viewState.zoom + viewState.offsetY,
  };

  return (
    <div
      className="absolute z-50 flex items-center gap-2"
      style={style}
    >
      <Input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSubmit();
          } else if (e.key === "Escape") {
            e.preventDefault();
            onCancel();
          }
        }}
        placeholder="Type text..."
        className="h-8 w-48 border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600"
        style={{
          fontSize: `${charHeight * viewState.zoom}px`,
          height: `${charHeight * viewState.zoom + 8}px`,
        }}
      />
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-zinc-800 text-green-400 hover:bg-zinc-700 hover:text-green-300"
          onClick={onSubmit}
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-zinc-800 text-red-400 hover:bg-zinc-700 hover:text-red-300"
          onClick={onCancel}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
