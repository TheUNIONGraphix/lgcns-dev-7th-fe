"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { postsListHref } from "@/lib/postsListHref";

export function useAdjacentPostPage({
  firstPage,
  lastPage,
  hasNextPage,
  hasPreviousPage,
  sortOrder,
  keyword,
}: {
  firstPage: number;
  lastPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  sortOrder: "ASC" | "DESC";
  keyword: string;
}) {
  const router = useRouter();
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const armPreviousRef = useRef(false);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    loadingRef.current = false;
    const top = topRef.current;
    const bottom = bottomRef.current;
    const observer = new IntersectionObserver((entries) => {
      if (loadingRef.current) return;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        if (entry.target === top) {
          if (!armPreviousRef.current || !hasPreviousPage || firstPage <= 1) continue;
          armPreviousRef.current = false;
          loadingRef.current = true;
          router.replace(postsListHref(firstPage - 1, sortOrder, keyword), { scroll: false });
          return;
        }
        if (entry.target === bottom && hasNextPage) {
          loadingRef.current = true;
          router.replace(postsListHref(lastPage + 1, sortOrder, keyword), { scroll: false });
          return;
        }
      }
    });

    if (top && hasPreviousPage) observer.observe(top);
    if (bottom && hasNextPage) observer.observe(bottom);
    return () => observer.disconnect();
  }, [firstPage, hasNextPage, hasPreviousPage, keyword, lastPage, router, sortOrder]);

  useEffect(() => {
    const requestPrevious = () => {
      armPreviousRef.current = true;
      const node = topRef.current;
      if (!node || loadingRef.current || !hasPreviousPage || firstPage <= 1) return;
      const rect = node.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;
      armPreviousRef.current = false;
      loadingRef.current = true;
      router.replace(postsListHref(firstPage - 1, sortOrder, keyword), { scroll: false });
    };

    const onScroll = () => {
      const y = window.scrollY;
      if (y < lastScrollYRef.current) requestPrevious();
      lastScrollYRef.current = y;
    };

    const onWheel = (event: WheelEvent) => {
      if (event.deltaY < 0) requestPrevious();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
    };
  }, [firstPage, hasPreviousPage, keyword, router, sortOrder]);

  return { topRef, bottomRef };
}
