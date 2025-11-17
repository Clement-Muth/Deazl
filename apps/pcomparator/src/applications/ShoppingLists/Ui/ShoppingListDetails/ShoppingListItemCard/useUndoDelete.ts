"use client";

import { useCallback, useRef, useState } from "react";

interface DeletedItem {
  id: string;
  data: any;
}

export const useUndoDelete = () => {
  const [pendingDeletes, setPendingDeletes] = useState<Map<string, DeletedItem>>(new Map());
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const scheduleDelete = useCallback((itemId: string, itemData: any, onConfirm: () => void, delay = 5000) => {
    // Store the item for potential undo
    setPendingDeletes((prev) => {
      const newMap = new Map(prev);
      newMap.set(itemId, { id: itemId, data: itemData });
      return newMap;
    });

    // Clear any existing timeout for this item
    const existingTimeout = timeoutRefs.current.get(itemId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Schedule the actual deletion
    const timeout = setTimeout(() => {
      onConfirm();
      setPendingDeletes((prev) => {
        const newMap = new Map(prev);
        newMap.delete(itemId);
        return newMap;
      });
      timeoutRefs.current.delete(itemId);
    }, delay);

    timeoutRefs.current.set(itemId, timeout);
  }, []);

  const undoDelete = useCallback(
    (itemId: string) => {
      // Clear the timeout
      const timeout = timeoutRefs.current.get(itemId);
      if (timeout) {
        clearTimeout(timeout);
        timeoutRefs.current.delete(itemId);
      }

      // Remove from pending deletes
      setPendingDeletes((prev) => {
        const newMap = new Map(prev);
        newMap.delete(itemId);
        return newMap;
      });

      return pendingDeletes.get(itemId);
    },
    [pendingDeletes]
  );

  const isPendingDelete = useCallback(
    (itemId: string) => {
      return pendingDeletes.has(itemId);
    },
    [pendingDeletes]
  );

  return { scheduleDelete, undoDelete, isPendingDelete };
};
