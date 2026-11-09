"use client";

import { useLayoutEffect, useRef } from "react";

export function usePreservePrependScroll(firstPage: number, loadedPages: number[]) {
  const firstPageRef = useRef(firstPage);
  const scrollHeightRef = useRef(0);

  useLayoutEffect(() => {
    const nextHeight = document.documentElement.scrollHeight;
    const keptPreviousTop =
      firstPage < firstPageRef.current && loadedPages.includes(firstPageRef.current);
    if (keptPreviousTop && scrollHeightRef.current > 0) {
      window.scrollBy(0, nextHeight - scrollHeightRef.current);
    }
    firstPageRef.current = firstPage;
    scrollHeightRef.current = nextHeight;
  }, [firstPage, loadedPages]);
}
