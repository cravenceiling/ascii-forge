# AGENTS.md - ASCII Forge

Guidelines for agentic coding agents working in this repository.

## Build & Development Commands

```bash
# Development server
bun run dev

# Type checking (use this instead of build for quick checks)
bun run typecheck

# Production build
bun run build

# Linting
bun run lint

# Preview production build
bun run preview

# Install shadcn components
bunx --bun shadcn@latest add <component-name>
```

## Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Package Manager**: Bun (do not use npm/yarn/pnpm)
- **Icons**: Lucide React

## Code Style Guidelines

### File Naming
- Use **kebab-case** for all filenames: `use-canvas.ts`, `ascii-grid.tsx`
- Components: PascalCase exports, kebab-case files
- Hooks: `use-[name].ts`
- Utils: `[name]-utils.ts`

### TypeScript
- **Strict typing required** - never use `any`
- Use `type` for type imports: `import type { Foo } from "@/types"`
- Export types from `@/types/index.ts`
- Prefer interfaces for object shapes
- Use const assertions for constants: `as const`

### React Patterns
- Use functional components with hooks
- Memoize expensive components with `React.memo`
- Use `useCallback` for event handlers passed to children
- Use `useMemo` for expensive computations
- Use refs for mutable values that shouldn't trigger re-renders
- CSS transforms over absolute positioning for animations

Also, use React Best Practices skill when possible.

### Imports
```typescript
// Order: React, external libs, internal types, internal components, internal hooks, internal utils
import { useState, memo } from "react";
import { cn } from "@/lib/utils";
import type { ToolType } from "@/types";
import { TOOLS } from "@/types";
import { Button } from "@/components/ui/button";
import { useCanvas } from "@/hooks/use-canvas";
import { drawBox } from "@/lib/canvas-utils";
```

### Styling
- Use Tailwind CSS classes
- Dark mode by default (zinc color palette)
- Common patterns:
  - `bg-zinc-950` - background
  - `text-white` / `text-zinc-400` - text
  - `border-zinc-800` - borders
  - `rounded-lg` - border radius

### Error Handling
- Prefer early returns over nested conditionals
- Validate array bounds before accessing
- Use functional state updates for race condition safety

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn components (import from here)
│   ├── toolbar.tsx
│   ├── ascii-grid.tsx
│   └── ...
├── hooks/
│   ├── use-canvas.ts
│   └── use-history.ts
├── lib/
│   ├── utils.ts         # shadcn utils (cn function)
│   └── canvas-utils.ts
├── types/
│   └── index.ts         # All TypeScript types
├── App.tsx
└── main.tsx
```

## Path Aliases

- `@/components/*` → `src/components/*`
- `@/hooks/*` → `src/hooks/*`
- `@/lib/*` → `src/lib/*`
- `@/types` → `src/types/index.ts`

## Key Conventions

1. **Performance**: This is a drawing app - optimize for performance
   - Memoize grid rendering
   - Use refs for mouse tracking (not state)
   - Minimize re-renders during drag operations

2. **State Management**:
   - Local state with `useState` for UI
   - Custom hooks for complex logic
   - `useHistory` hook for undo/redo

3. **Canvas Coordinates**:
   - Use `getBoundingClientRect()` for coordinate conversion
   - Account for zoom and pan offsets
   - Grid coordinates are integer-based

4. **ASCII Drawing**:
   - Character dimensions: 9x17 pixels
   - Grid-based rendering (not SVG/Canvas)
   - Support live preview during drag

## Do Not

- Use `any` type
- Use npm/yarn/pnpm (use bun)
- Create files with camelCase or PascalCase names
- Add unnecessary dependencies
- Use CSS-in-JS (use Tailwind)
- Modify shadcn component internals

## Before Committing

1. Run `bun run typecheck` - must pass with zero errors
2. Run `bun run lint` - must pass
3. Test the app works: `bun run dev`

## User Preferences

- Dark mode by default
- Top toolbar (like Excalidraw)
- Keyboard shortcuts for tools (B=Box, L=Line, etc.)
- Live preview while drawing
- Fully offline app (minimal dependencies)
