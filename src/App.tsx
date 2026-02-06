import { memo, useCallback, useEffect, useRef, useState } from "react";
import { AsciiGrid, type AsciiGridHandle } from "@/components/ascii-grid";
import { TextInputOverlay } from "@/components/text-input-overlay";
import { Toolbar } from "@/components/toolbar";
import { ZoomControls } from "@/components/zoom-controls";
import { useCanvas } from "@/hooks/use-canvas";
import { useHistory } from "@/hooks/use-history";
import {
  drawArrow,
  drawBox,
  drawLine,
  drawText,
  eraseArea,
  gridToString,
  mergeGrids,
} from "@/lib/canvas-utils";
import type { Point, SparseGrid, ToolType } from "@/types";
import { ASCII_CHARS, TOOLS } from "@/types";

const MemoizedToolbar = memo(Toolbar);
const MemoizedZoomControls = memo(ZoomControls);

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const asciiGridRef = useRef<AsciiGridHandle>(null);
  const {
    committedGrid,
    setCommittedGrid,
    scratchGrid,
    setScratchGrid,
    viewState,
    screenToGrid,
    zoomIn,
    zoomOut,
    zoomReset,
    charDimensions,
  } = useCanvas({
    containerRef,
    asciiGridRef,
  });

  const { undo, redo, canUndo, canRedo, push } = useHistory<SparseGrid>(
    committedGrid,
    setCommittedGrid,
  );

  const [currentTool, setCurrentTool] = useState<ToolType>("selection");
  const [textInputPosition, setTextInputPosition] = useState<Point | null>(
    null,
  );
  const [currentText, setCurrentText] = useState("");
  const [showGrid, setShowGrid] = useState(false);

  const currentToolRef = useRef(currentTool);

  useEffect(() => {
    currentToolRef.current = currentTool;
  }, [currentTool]);

  const isDrawingRef = useRef(false);
  const drawStartRef = useRef<Point | null>(null);
  const isTypingRef = useRef(false);

  const handleTextSubmitRef = useRef<() => void>(undefined);
  const handleTextCancelRef = useRef<() => void>(undefined);
  const handleToolChangeRef = useRef<(tool: ToolType) => void>(undefined);

  useEffect(() => {
    isTypingRef.current = textInputPosition !== null;
  }, [textInputPosition]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTypingRef.current) {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          handleTextSubmitRef.current?.();
        } else if (e.key === "Escape") {
          e.preventDefault();
          handleTextCancelRef.current?.();
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        redo();
        return;
      }

      const tool = TOOLS.find(
        (t) => t.shortcut.toLowerCase() === e.key.toLowerCase(),
      );
      if (tool) {
        e.preventDefault();
        handleToolChangeRef.current?.(tool.type);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  const calculatePreview = useCallback(
    (tool: ToolType, start: Point, end: Point): SparseGrid => {
      const emptyGrid = new Map<string, string>();

      switch (tool) {
        case "box":
          return drawBox(emptyGrid, start, end);
        case "line":
          return drawLine(emptyGrid, start, end);
        case "arrow":
          return drawArrow(emptyGrid, start, end);
        case "eraser":
          return eraseArea(committedGrid, start, end);
        default:
          return emptyGrid;
      }
    },
    [committedGrid],
  );

  const handleToolChange = useCallback(
    (tool: ToolType) => {
      setCurrentTool(tool);
      setTextInputPosition(null);
      setCurrentText("");
      setScratchGrid(new Map());
    },
    [setScratchGrid],
  );

  useEffect(() => {
    handleToolChangeRef.current = handleToolChange;
  }, [handleToolChange]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const point = screenToGrid(e.clientX, e.clientY);

      if (currentToolRef.current === "text") {
        setTextInputPosition(point);
        setCurrentText("");
        return;
      }

      isDrawingRef.current = true;
      drawStartRef.current = point;

      if (currentToolRef.current === "eraser") {
        const preview = calculatePreview("eraser", point, point);
        setScratchGrid(preview);
      } else if (currentToolRef.current !== "selection") {
        const preview = calculatePreview(currentToolRef.current, point, point);
        setScratchGrid(preview);
      }
    },
    [screenToGrid, calculatePreview, setScratchGrid],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDrawingRef.current) return;

      const point = screenToGrid(e.clientX, e.clientY);

      if (drawStartRef.current && currentToolRef.current !== "selection") {
        const preview = calculatePreview(
          currentToolRef.current,
          drawStartRef.current,
          point,
        );
        setScratchGrid(preview);
      }
    },
    [screenToGrid, calculatePreview, setScratchGrid],
  );

  const handleMouseUp = useCallback(() => {
    if (!isDrawingRef.current || !drawStartRef.current) {
      isDrawingRef.current = false;
      setScratchGrid(new Map());
      return;
    }

    // For eraser, we need to apply the changes
    if (currentToolRef.current === "eraser") {
      const newGrid = new Map(committedGrid);
      for (const [key, char] of scratchGrid.entries()) {
        if (char === ASCII_CHARS.SPACE) {
          newGrid.delete(key);
        }
      }
      push(newGrid);
    } else if (currentToolRef.current !== "selection") {
      // Merge scratch into committed
      const newGrid = mergeGrids(committedGrid, scratchGrid);
      push(newGrid);
    }

    setScratchGrid(new Map());
    isDrawingRef.current = false;
    drawStartRef.current = null;
  }, [committedGrid, scratchGrid, push, setScratchGrid]);

  const handleToggleGrid = useCallback(() => {
    setShowGrid((prev) => !prev);
  }, []);

  const handleExport = useCallback(() => {
    // Calculate bounds for export
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const key of committedGrid.keys()) {
      const [x, y] = key.split(",").map(Number);
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }

    if (minX === Infinity) {
      // Empty grid
      return;
    }

    const width = maxX - minX + 1;
    const height = maxY - minY + 1;

    const text = gridToString(committedGrid, width, height);
    navigator.clipboard.writeText(text);

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ascii-diagram.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [committedGrid]);

  const handleTextSubmit = useCallback(() => {
    if (textInputPosition && currentText) {
      const newGrid = drawText(committedGrid, textInputPosition, currentText);
      push(newGrid);
    }
    setTextInputPosition(null);
    setCurrentText("");
  }, [textInputPosition, currentText, committedGrid, push]);

  const handleTextCancel = useCallback(() => {
    setTextInputPosition(null);
    setCurrentText("");
  }, []);

  // Update refs with latest callbacks for keyboard handler
  useEffect(() => {
    handleTextSubmitRef.current = handleTextSubmit;
  }, [handleTextSubmit]);

  useEffect(() => {
    handleTextCancelRef.current = handleTextCancel;
  }, [handleTextCancel]);

  useEffect(() => {
    handleToolChangeRef.current = handleToolChange;
  }, [handleToolChange]);

  // Calculate display grid by merging committed + scratch
  const displayCommitted = committedGrid;
  const displayScratch = scratchGrid;

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-screen overflow-hidden bg-zinc-950"
    >
      <div className="absolute left-1/2 top-4 z-50 -translate-x-1/2">
        <MemoizedToolbar
          currentTool={currentTool}
          onToolChange={handleToolChange}
        />
      </div>

      <div className="absolute bottom-4 left-4 z-50">
        <MemoizedZoomControls
          zoom={viewState.zoom}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onZoomReset={zoomReset}
          onExport={handleExport}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          showGrid={showGrid}
          onToggleGrid={handleToggleGrid}
        />
      </div>

      <div className="absolute right-4 top-4 z-50 text-xs text-zinc-500">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/95 px-3 py-2 shadow-lg backdrop-blur-sm">
          <p>
            Shortcuts: V-Selection, B-Box, L-Line, A-Arrow, T-Text, E-Eraser
          </p>
          <p>Ctrl+Z/Y - Undo/Redo</p>
        </div>
      </div>

      <AsciiGrid
        ref={asciiGridRef}
        committedGrid={displayCommitted}
        scratchGrid={displayScratch}
        viewState={viewState}
        showGrid={showGrid}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      <TextInputOverlay
        position={textInputPosition}
        text={currentText}
        onTextChange={setCurrentText}
        onSubmit={handleTextSubmit}
        onCancel={handleTextCancel}
        viewState={viewState}
        charWidth={charDimensions.width}
        charHeight={charDimensions.height}
      />
    </div>
  );
}

export default App;
