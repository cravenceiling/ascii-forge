export type ToolType =
  | "selection"
  | "box"
  | "line"
  | "arrow"
  | "text"
  | "eraser";

export interface Point {
  x: number;
  y: number;
}

export type SparseGrid = Map<string, string>;

export interface ViewState {
  zoom: number;
  offsetX: number;
  offsetY: number;
}

export interface ToolConfig {
  type: ToolType;
  label: string;
  icon: string;
  shortcut: string;
}

export const TOOLS: ToolConfig[] = [
  { type: "selection", label: "Selection", icon: "MousePointer2", shortcut: "V" },
  { type: "box", label: "Box", icon: "Square", shortcut: "B" },
  { type: "line", label: "Line", icon: "Minus", shortcut: "L" },
  { type: "arrow", label: "Arrow", icon: "ArrowRight", shortcut: "A" },
  { type: "text", label: "Text", icon: "Type", shortcut: "T" },
  { type: "eraser", label: "Eraser", icon: "Eraser", shortcut: "E" },
];

export const ASCII_CHARS = {
  HORIZONTAL: "-",
  VERTICAL: "|",
  CORNER_TL: "+",
  CORNER_TR: "+",
  CORNER_BL: "+",
  CORNER_BR: "+",
  INTERSECTION: "+",
  DIAGONAL_UP: "/",
  DIAGONAL_DOWN: "\\",
  ARROW_HEAD_RIGHT: ">",
  ARROW_HEAD_LEFT: "<",
  ARROW_HEAD_UP: "^",
  ARROW_HEAD_DOWN: "v",
  SPACE: " ",
} as const;

export type AsciiChar = (typeof ASCII_CHARS)[keyof typeof ASCII_CHARS];

export const CHAR_WIDTH = 9;
export const CHAR_HEIGHT = 17;
export const MAX_GRID_WIDTH = 1000;
export const MAX_GRID_HEIGHT = 1000;
