"use client";

import { useEffect, useState } from "react";

export function useVisiblePostPage(anchorPage: number) {
  const [visiblePage, setVisiblePage] = useState(anchorPage);
  const [trackedAnchor, setTrackedAnchor] = useState(anchorPage);

  if (anchorPage !== trackedAnchor) {
    setTrackedAnchor(anchorPage);
    setVisiblePage(anchorPage);
  }

  useEffect(() => {
    const update = () => {
      const nodes = document.querySelectorAll<HTMLElement>("[data-post-page]");
      const line = window.innerHeight * 0.35;
      let current = Number(nodes[0]?.dataset.postPage ?? anchorPage);
      nodes.forEach((node) => {
        if (node.getBoundingClientRect().top <= line) {
          current = Number(node.dataset.postPage);
        }
      });
      if (!Number.isInteger(current) || current < 1) return;
      setVisiblePage((prev) => (prev === current ? prev : current));
    };

    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [anchorPage]);

  return visiblePage;
}
