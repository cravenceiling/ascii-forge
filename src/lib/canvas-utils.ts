import type { Point, SparseGrid } from "@/types";
import { ASCII_CHARS } from "@/types";

export function posKey(x: number, y: number): string {
  return `${x},${y}`;
}

export function parsePos(key: string): Point {
  const [x, y] = key.split(",").map(Number);
  return { x, y };
}

export function getCell(grid: SparseGrid, x: number, y: number): string {
  return grid.get(posKey(x, y)) || ASCII_CHARS.SPACE;
}

export function setCell(
  grid: SparseGrid,
  x: number,
  y: number,
  char: string
): SparseGrid {
  const newGrid = new Map(grid);
  if (char === ASCII_CHARS.SPACE || char === "") {
    newGrid.delete(posKey(x, y));
  } else {
    newGrid.set(posKey(x, y), char);
  }
  return newGrid;
}

export function drawHorizontalLine(
  grid: SparseGrid,
  x1: number,
  x2: number,
  y: number,
  char: string = ASCII_CHARS.HORIZONTAL
): SparseGrid {
  const newGrid = new Map(grid);
  const startX = Math.min(x1, x2);
  const endX = Math.max(x1, x2);

  for (let x = startX; x <= endX; x++) {
    newGrid.set(posKey(x, y), char);
  }

  return newGrid;
}

export function drawVerticalLine(
  grid: SparseGrid,
  y1: number,
  y2: number,
  x: number,
  char: string = ASCII_CHARS.VERTICAL
): SparseGrid {
  const newGrid = new Map(grid);
  const startY = Math.min(y1, y2);
  const endY = Math.max(y1, y2);

  for (let y = startY; y <= endY; y++) {
    newGrid.set(posKey(x, y), char);
  }

  return newGrid;
}

export function drawDiagonalLine(
  grid: SparseGrid,
  start: Point,
  end: Point
): SparseGrid {
  const newGrid = new Map(grid);
  const dx = Math.abs(end.x - start.x);
  const dy = Math.abs(end.y - start.y);
  const sx = start.x < end.x ? 1 : -1;
  const sy = start.y < end.y ? 1 : -1;

  let x = start.x;
  let y = start.y;
  let err = dx - dy;

  while (true) {
    const char = dx > dy ? ASCII_CHARS.HORIZONTAL : ASCII_CHARS.DIAGONAL_DOWN;
    newGrid.set(posKey(x, y), char);

    if (x === end.x && y === end.y) break;

    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }

  return newGrid;
}

export function drawBox(
  grid: SparseGrid,
  start: Point,
  end: Point
): SparseGrid {
  const newGrid = new Map(grid);
  const x1 = Math.min(start.x, end.x);
  const x2 = Math.max(start.x, end.x);
  const y1 = Math.min(start.y, end.y);
  const y2 = Math.max(start.y, end.y);

  if (x2 - x1 < 2 || y2 - y1 < 2) return newGrid;

  for (let x = x1; x <= x2; x++) {
    const topChar = x === x1 || x === x2 ? ASCII_CHARS.CORNER_TL : ASCII_CHARS.HORIZONTAL;
    const bottomChar = x === x1 || x === x2 ? ASCII_CHARS.CORNER_BL : ASCII_CHARS.HORIZONTAL;
    newGrid.set(posKey(x, y1), topChar);
    newGrid.set(posKey(x, y2), bottomChar);
  }

  for (let y = y1; y <= y2; y++) {
    const leftChar =
      y === y1 ? ASCII_CHARS.CORNER_TL : y === y2 ? ASCII_CHARS.CORNER_BL : ASCII_CHARS.VERTICAL;
    const rightChar =
      y === y1 ? ASCII_CHARS.CORNER_TR : y === y2 ? ASCII_CHARS.CORNER_BR : ASCII_CHARS.VERTICAL;
    newGrid.set(posKey(x1, y), leftChar);
    newGrid.set(posKey(x2, y), rightChar);
  }

  newGrid.set(posKey(x1, y1), ASCII_CHARS.CORNER_TL);
  newGrid.set(posKey(x2, y1), ASCII_CHARS.CORNER_TR);
  newGrid.set(posKey(x1, y2), ASCII_CHARS.CORNER_BL);
  newGrid.set(posKey(x2, y2), ASCII_CHARS.CORNER_BR);

  return newGrid;
}

export function drawLine(
  grid: SparseGrid,
  start: Point,
  end: Point
): SparseGrid {
  const dx = Math.abs(end.x - start.x);
  const dy = Math.abs(end.y - start.y);

  if (dx === 0) {
    return drawVerticalLine(grid, start.y, end.y, start.x);
  } else if (dy === 0) {
    return drawHorizontalLine(grid, start.x, end.x, start.y);
  } else {
    return drawDiagonalLine(grid, start, end);
  }
}

export function drawArrow(
  grid: SparseGrid,
  start: Point,
  end: Point
): SparseGrid {
  let newGrid = drawLine(grid, start, end);
  newGrid = new Map(newGrid);

  let arrowHead: string;
  if (Math.abs(end.x - start.x) > Math.abs(end.y - start.y)) {
    arrowHead = end.x > start.x ? ASCII_CHARS.ARROW_HEAD_RIGHT : ASCII_CHARS.ARROW_HEAD_LEFT;
  } else {
    arrowHead = end.y > start.y ? ASCII_CHARS.ARROW_HEAD_DOWN : ASCII_CHARS.ARROW_HEAD_UP;
  }

  newGrid.set(posKey(end.x, end.y), arrowHead);

  return newGrid;
}

export function drawText(
  grid: SparseGrid,
  start: Point,
  text: string
): SparseGrid {
  const newGrid = new Map(grid);

  for (let i = 0; i < text.length; i++) {
    const x = start.x + i;
    const y = start.y;
    const char = text[i];
    
    if (char !== ASCII_CHARS.SPACE) {
      newGrid.set(posKey(x, y), char);
    }
  }

  return newGrid;
}

export function eraseCell(grid: SparseGrid, point: Point): SparseGrid {
  const newGrid = new Map(grid);
  newGrid.delete(posKey(point.x, point.y));
  return newGrid;
}

export function eraseArea(
  grid: SparseGrid,
  start: Point,
  end: Point
): SparseGrid {
  const newGrid = new Map(grid);
  const x1 = Math.min(start.x, end.x);
  const x2 = Math.max(start.x, end.x);
  const y1 = Math.min(start.y, end.y);
  const y2 = Math.max(start.y, end.y);

  for (let y = y1; y <= y2; y++) {
    for (let x = x1; x <= x2; x++) {
      newGrid.delete(posKey(x, y));
    }
  }

  return newGrid;
}

export function gridToString(grid: SparseGrid, width: number, height: number): string {
  const lines: string[] = [];
  
  for (let y = 0; y < height; y++) {
    let line = "";
    for (let x = 0; x < width; x++) {
      line += grid.get(posKey(x, y)) || ASCII_CHARS.SPACE;
    }
    lines.push(line);
  }
  
  return lines.join("\n");
}

export function mergeGrids(base: SparseGrid, overlay: SparseGrid): SparseGrid {
  const result = new Map(base);
  for (const [key, value] of overlay.entries()) {
    if (value === ASCII_CHARS.SPACE) {
      result.delete(key);
    } else {
      result.set(key, value);
    }
  }
  return result;
}
