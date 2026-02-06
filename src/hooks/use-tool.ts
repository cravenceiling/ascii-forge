import { useCallback, useState } from "react";
import type { Point, ToolType } from "@/types";
import { TOOLS } from "@/types";

interface UseToolOptions {
  onDraw: (tool: ToolType, start: Point, end: Point, text?: string) => void;
}

export function useTool({ onDraw }: UseToolOptions) {
  const [currentTool, setCurrentTool] = useState<ToolType>("selection");
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<Point | null>(null);
  const [drawEnd, setDrawEnd] = useState<Point | null>(null);
  const [textInput, setTextInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleToolChange = useCallback((tool: ToolType) => {
    setCurrentTool(tool);
    setIsTyping(false);
    setTextInput("");
  }, []);

  const handleMouseDown = useCallback(
    (point: Point) => {
      if (currentTool === "text") {
        setDrawStart(point);
        setIsTyping(true);
        setTextInput("");
        return;
      }

      setIsDrawing(true);
      setDrawStart(point);
      setDrawEnd(point);
    },
    [currentTool],
  );

  const handleMouseMove = useCallback(
    (point: Point) => {
      if (isDrawing) {
        setDrawEnd(point);
      }
    },
    [isDrawing],
  );

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !drawStart || !drawEnd) {
      setIsDrawing(false);
      return;
    }

    onDraw(currentTool, drawStart, drawEnd);
    setIsDrawing(false);
    setDrawStart(null);
    setDrawEnd(null);
  }, [isDrawing, drawStart, drawEnd, currentTool, onDraw]);

  const handleTextSubmit = useCallback(() => {
    if (drawStart && textInput && textInput.length > 0) {
      onDraw("text", drawStart, drawStart, textInput);
    }
    setIsTyping(false);
    setTextInput("");
    setDrawStart(null);
  }, [drawStart, textInput, onDraw]);

  const handleTextCancel = useCallback(() => {
    setIsTyping(false);
    setTextInput("");
    setDrawStart(null);
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (isTyping) {
        if (event.key === "Enter") {
          event.preventDefault();
          handleTextSubmit();
        } else if (event.key === "Escape") {
          event.preventDefault();
          handleTextCancel();
        }
        return;
      }

      const tool = TOOLS.find(
        (t) => t.shortcut.toLowerCase() === event.key.toLowerCase(),
      );
      if (tool && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        handleToolChange(tool.type);
      }
    },
    [isTyping, handleToolChange, handleTextSubmit, handleTextCancel],
  );

  return {
    currentTool,
    setCurrentTool: handleToolChange,
    isDrawing,
    drawStart,
    drawEnd,
    isTyping,
    textInput,
    setTextInput,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTextSubmit,
    handleTextCancel,
    handleKeyDown,
  };
}
