import { useState, useCallback } from "react";

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

const MAX_HISTORY_SIZE = 50;

export function useHistory<T>(
  currentState: T,
  setCurrentState: (state: T) => void
) {
  const [history, setHistory] = useState<HistoryState<T>>({
    past: [],
    present: currentState,
    future: [],
  });

  // Sync external state when history.present changes
  if (history.present !== currentState) {
    setHistory((prev) => ({
      ...prev,
      present: currentState,
    }));
  }

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const push = useCallback(
    (newState: T) => {
      if (newState === history.present) return;

      setHistory((prev) => ({
        past: [...prev.past.slice(-MAX_HISTORY_SIZE + 1), prev.present],
        present: newState,
        future: [],
      }));
      setCurrentState(newState);
    },
    [history.present, setCurrentState]
  );

  const undo = useCallback(() => {
    if (history.past.length === 0) return;

    const previous = history.past[history.past.length - 1];
    const newPast = history.past.slice(0, -1);

    setHistory({
      past: newPast,
      present: previous,
      future: [history.present, ...history.future],
    });
    setCurrentState(previous);
  }, [history, setCurrentState]);

  const redo = useCallback(() => {
    if (history.future.length === 0) return;

    const next = history.future[0];
    const newFuture = history.future.slice(1);

    setHistory({
      past: [...history.past, history.present],
      present: next,
      future: newFuture,
    });
    setCurrentState(next);
  }, [history, setCurrentState]);

  return {
    undo,
    redo,
    push,
    canUndo,
    canRedo,
  };
}
