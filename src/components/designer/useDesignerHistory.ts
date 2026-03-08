import { useState, useCallback } from "react";
import type { HistoryState } from "./types";

export function useDesignerHistory(initial: HistoryState) {
  const [history, setHistory] = useState<HistoryState[]>([initial]);
  const [pointer, setPointer] = useState(0);

  const current = history[pointer];

  const push = useCallback((state: HistoryState) => {
    setHistory((prev) => {
      const next = prev.slice(0, pointer + 1);
      next.push(state);
      // cap at 50 steps
      if (next.length > 50) next.shift();
      return next;
    });
    setPointer((p) => Math.min(p + 1, 49));
  }, [pointer]);

  const undo = useCallback(() => {
    setPointer((p) => Math.max(0, p - 1));
  }, []);

  const redo = useCallback(() => {
    setPointer((p) => Math.min(history.length - 1, p + 1));
  }, [history.length]);

  const canUndo = pointer > 0;
  const canRedo = pointer < history.length - 1;

  return { current, push, undo, redo, canUndo, canRedo };
}
