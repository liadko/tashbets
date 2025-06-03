import { useState, useCallback } from "react";

export function useCopyFlags() {
  // two separate “copying” flags
  const [copying1, setCopying1] = useState(false);
  const [copying2, setCopying2] = useState(false);

  /**
   * call setCopying(0) to toggle copying1, or setCopying(1) to toggle copying2.
   * Passing any other index does nothing.
   */
  const setCopying = useCallback((index: 1 | 2, value: boolean) => {
    if (index === 1) {
      setCopying1(value);
    } else if (index === 2) {
      setCopying2(value);
    }
  }, []);

  return { copying1, copying2, setCopying };
}
