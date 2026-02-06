import { useState, useCallback, useEffect } from "react";
import type { Point, ViewState, SparseGrid } from "@/types";
import type { AsciiGridHandle } from "@/components/ascii-grid";
import { CHAR_WIDTH, CHAR_HEIGHT } from "@/types";

const INITIAL_COLS = 200;
const INITIAL_ROWS = 100;
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 3;

interface UseCanvasOptions {
  containerRef: React.RefObject<HTMLElement | null>;
  asciiGridRef: React.RefObject<AsciiGridHandle | null>;
}

export function useCanvas({ containerRef, asciiGridRef }: UseCanvasOptions) {
  const [committedGrid, setCommittedGrid] = useState<SparseGrid>(() => new Map());
  const [scratchGrid, setScratchGrid] = useState<SparseGrid>(() => new Map());
  const [viewState, setViewState] = useState<ViewState>({
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
  });

  const screenToGrid = useCallback(
    (screenX: number, screenY: number): Point => {
      const asciiGrid = asciiGridRef.current;
      if (!asciiGrid) return { x: 0, y: 0 };

      return asciiGrid.screenToGrid(screenX, screenY);
    },
    [asciiGridRef]
  );

  const gridToScreen = useCallback(
    (gridX: number, gridY: number): Point => {
      return {
        x: gridX * CHAR_WIDTH * viewState.zoom + viewState.offsetX,
        y: gridY * CHAR_HEIGHT * viewState.zoom + viewState.offsetY,
      };
    },
    [viewState.zoom, viewState.offsetX, viewState.offsetY]
  );

  const getVisibleRange = useCallback(() => {
    const container = containerRef.current;
    if (!container) {
      return {
        startCol: 0,
        endCol: INITIAL_COLS,
        startRow: 0,
        endRow: INITIAL_ROWS,
      };
    }

    const { clientWidth, clientHeight } = container;
    const padding = 2;

    const startCol = Math.max(0, Math.floor(-viewState.offsetX / (CHAR_WIDTH * viewState.zoom)) - padding);
    const endCol = Math.ceil((clientWidth - viewState.offsetX) / (CHAR_WIDTH * viewState.zoom)) + padding;
    const startRow = Math.max(0, Math.floor(-viewState.offsetY / (CHAR_HEIGHT * viewState.zoom)) - padding);
    const endRow = Math.ceil((clientHeight - viewState.offsetY) / (CHAR_HEIGHT * viewState.zoom)) + padding;

    return { startCol, endCol, startRow, endRow };
  }, [containerRef, viewState]);

  const zoomIn = useCallback(() => {
    setViewState((prev) => ({
      ...prev,
      zoom: Math.min(prev.zoom * 1.2, MAX_ZOOM),
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setViewState((prev) => ({
      ...prev,
      zoom: Math.max(prev.zoom / 1.2, MIN_ZOOM),
    }));
  }, []);

  const zoomReset = useCallback(() => {
    setViewState((prev) => ({
      ...prev,
      zoom: 1,
    }));
  }, []);

  const pan = useCallback((dx: number, dy: number) => {
    setViewState((prev) => ({
      ...prev,
      offsetX: prev.offsetX + dx,
      offsetY: prev.offsetY + dy,
    }));
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const canvas = asciiGridRef.current?.getCanvas();
      if (canvas && containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        canvas.width = clientWidth;
        canvas.height = clientHeight;
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [containerRef, asciiGridRef]);

  return {
    committedGrid,
    setCommittedGrid,
    scratchGrid,
    setScratchGrid,
    viewState,
    screenToGrid,
    gridToScreen,
    getVisibleRange,
    zoomIn,
    zoomOut,
    zoomReset,
    pan,
    charDimensions: { width: CHAR_WIDTH, height: CHAR_HEIGHT },
  };
}
