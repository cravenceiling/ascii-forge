import {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import type { Point, SparseGrid, ViewState } from "@/types";
import { ASCII_CHARS, CHAR_HEIGHT, CHAR_WIDTH } from "@/types";

interface AsciiGridProps {
  committedGrid: SparseGrid;
  scratchGrid: SparseGrid;
  viewState: ViewState;
  showGrid: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: (e: React.MouseEvent) => void;
  onMouseLeave: (e: React.MouseEvent) => void;
}

const FONT_SIZE = 15;
const FONT_FAMILY = "'Courier New', monospace";
const TEXT_COLOR = "#e4e4e7"; // zinc-200
const GRID_COLOR = "#27272a"; // zinc-800
const SCRATCH_BG_COLOR = "rgba(59, 130, 246, 0.2)"; // blue-500 with opacity

export interface AsciiGridHandle {
  screenToGrid: (screenX: number, screenY: number) => Point;
  getCanvas: () => HTMLCanvasElement | null;
}

export const AsciiGrid = memo(
  forwardRef<AsciiGridHandle, AsciiGridProps>(function AsciiGrid(
    {
      committedGrid,
      scratchGrid,
      viewState,
      showGrid,
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onMouseLeave,
    },
    ref,
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | undefined>(undefined);

    // Expose methods via ref
    useImperativeHandle(
      ref,
      () => ({
        screenToGrid: (screenX: number, screenY: number) => {
          const canvas = canvasRef.current;
          if (!canvas) return { x: 0, y: 0 };

          const rect = canvas.getBoundingClientRect();
          const relativeX =
            (screenX - rect.left - viewState.offsetX) / viewState.zoom;
          const relativeY =
            (screenY - rect.top - viewState.offsetY) / viewState.zoom;

          return {
            x: Math.floor(relativeX / CHAR_WIDTH),
            y: Math.floor(relativeY / CHAR_HEIGHT),
          };
        },
        getCanvas: () => canvasRef.current,
      }),
      [viewState],
    );

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const render = () => {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Save context for transforms
        ctx.save();

        // Apply zoom and pan transforms
        ctx.translate(viewState.offsetX, viewState.offsetY);
        ctx.scale(viewState.zoom, viewState.zoom);

        // Calculate visible range
        const padding = 2;

        const startCol = Math.max(
          0,
          Math.floor(-viewState.offsetX / (CHAR_WIDTH * viewState.zoom)) -
            padding,
        );
        const endCol =
          Math.ceil(
            (canvas.width - viewState.offsetX) / (CHAR_WIDTH * viewState.zoom),
          ) + padding;
        const startRow = Math.max(
          0,
          Math.floor(-viewState.offsetY / (CHAR_HEIGHT * viewState.zoom)) -
            padding,
        );
        const endRow =
          Math.ceil(
            (canvas.height - viewState.offsetY) /
              (CHAR_HEIGHT * viewState.zoom),
          ) + padding;

        // Draw grid lines if enabled
        if (showGrid) {
          ctx.strokeStyle = GRID_COLOR;
          ctx.lineWidth = 1 / viewState.zoom;
          ctx.beginPath();

          for (let x = startCol; x <= endCol; x++) {
            const xPos = x * CHAR_WIDTH;
            ctx.moveTo(xPos, startRow * CHAR_HEIGHT);
            ctx.lineTo(xPos, (endRow + 1) * CHAR_HEIGHT);
          }

          for (let y = startRow; y <= endRow; y++) {
            const yPos = y * CHAR_HEIGHT;
            ctx.moveTo(startCol * CHAR_WIDTH, yPos);
            ctx.lineTo((endCol + 1) * CHAR_WIDTH, yPos);
          }

          ctx.stroke();
        }

        // Set font for characters
        ctx.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
        ctx.textBaseline = "top";
        ctx.fillStyle = TEXT_COLOR;

        // Draw committed cells
        for (const [key, char] of committedGrid.entries()) {
          const [x, y] = key.split(",").map(Number);

          // Skip if outside visible range
          if (x < startCol || x > endCol || y < startRow || y > endRow)
            continue;
          if (char === ASCII_CHARS.SPACE) continue;

          const screenX = x * CHAR_WIDTH;
          const screenY = y * CHAR_HEIGHT + 2; // +2 for visual centering

          ctx.fillText(char, screenX, screenY);
        }

        // Draw scratch (preview) cells with highlight
        for (const [key, char] of scratchGrid.entries()) {
          const [x, y] = key.split(",").map(Number);

          if (x < startCol || x > endCol || y < startRow || y > endRow)
            continue;
          if (char === ASCII_CHARS.SPACE) continue;

          const screenX = x * CHAR_WIDTH;
          const screenY = y * CHAR_HEIGHT;

          // Draw highlight background
          ctx.fillStyle = SCRATCH_BG_COLOR;
          ctx.fillRect(screenX, screenY, CHAR_WIDTH, CHAR_HEIGHT);

          // Draw character
          ctx.fillStyle = TEXT_COLOR;
          ctx.fillText(char, screenX, screenY + 2);
        }

        ctx.restore();
      };

      const animate = () => {
        render();
        animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, [committedGrid, scratchGrid, viewState, showGrid]);

    return (
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-crosshair"
        style={{ imageRendering: "pixelated" }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
      />
    );
  }),
);
