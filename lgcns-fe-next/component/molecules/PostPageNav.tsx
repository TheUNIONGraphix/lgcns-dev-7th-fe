"use client";

import Link from "next/link";
import { Nav } from "@/components/ui/landmark";
import { useLayoutEffect, useRef, useState } from "react";
import { postsListHref } from "@/lib/postsListHref";

const ITEM_GAP = 8;
const NARROW_ITEM = 40;
const WIDE_ITEM = 52;

type PageMark = number | "ellipsis";

function range(start: number, end: number) {
  const pages: number[] = [];
  for (let page = start; page <= end; page += 1) pages.push(page);
  return pages;
}

function windowMarks(current: number, total: number, sibling: number): PageMark[] {
  const visibleCount = sibling * 2 + 5;
  if (total <= visibleCount) return range(1, total);

  const left = Math.max(current - sibling, 1);
  const right = Math.min(current + sibling, total);
  const showLeft = left > 2;
  const showRight = right < total - 1;

  if (!showLeft && showRight) {
    const leftCount = Math.min(total - 2, 3 + sibling * 2);
    return [...range(1, leftCount), "ellipsis", total];
  }
  if (showLeft && !showRight) {
    const rightCount = Math.min(total - 2, 3 + sibling * 2);
    return [1, "ellipsis", ...range(total - rightCount + 1, total)];
  }
  return [1, "ellipsis", ...range(left, right), "ellipsis", total];
}

function edgeMarks(current: number, total: number, room: number): PageMark[] {
  if (room >= total) return range(1, total);
  if (room <= 1) return [current];
  if (room === 2) return [1, total];
  if (room === 3) return [1, "ellipsis", total];
  if (current <= room - 2) return [...range(1, room - 2), "ellipsis", total];
  if (current >= total - (room - 3)) {
    return [1, "ellipsis", ...range(total - (room - 3), total)];
  }
  if (room === 4) return [1, "ellipsis", current, total];
  return [1, "ellipsis", current, "ellipsis", total];
}

function pageMarks(current: number, total: number, slots: number): PageMark[] {
  const room = Math.max(1, Math.min(slots, total));
  if (room >= total) return range(1, total);

  let best = windowMarks(current, total, 0);
  if (best.length > room) return edgeMarks(current, total, room);

  let sibling = 1;
  while (sibling < total) {
    const next = windowMarks(current, total, sibling);
    if (next.length > room) break;
    best = next;
    if (next.length === room || next.length >= total) break;
    sibling += 1;
  }
  return best;
}

function slotCount(width: number, itemWidth: number) {
  if (width <= 0) return 0;
  return Math.max(1, Math.floor((width + ITEM_GAP) / (itemWidth + ITEM_GAP)));
}

const pageClass =
  "inline-flex h-10 min-w-10 shrink-0 items-center justify-center rounded-[12px] border border-[#d1d5db] bg-white px-2 text-[14px] font-semibold text-[#374151]";
const currentClass =
  "inline-flex h-10 min-w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#2563eb] px-2 text-[14px] font-semibold text-white";
const stepClass =
  "inline-flex h-10 shrink-0 items-center rounded-[12px] border border-[#d1d5db] bg-white px-4 text-[14px] font-semibold text-[#374151]";
const stepDisabledClass =
  "inline-flex h-10 shrink-0 items-center rounded-[12px] border border-[#e5e7eb] bg-[#f9fafb] px-4 text-[14px] font-semibold text-[#9ca3af]";

export default function PostPageNav({
  currentPage,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  sortOrder,
  keyword,
}: {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  sortOrder: "ASC" | "DESC";
  keyword: string;
}) {
  const listRef = useRef<HTMLUListElement>(null);
  const [slots, setSlots] = useState(5);
  const itemWidth = totalPages >= 100 ? WIDE_ITEM : NARROW_ITEM;

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const update = () => {
      const next = slotCount(list.clientWidth, itemWidth);
      if (next === 0) return;
      setSlots((prev) => (prev === next ? prev : next));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(list);
    return () => observer.disconnect();
  }, [itemWidth]);

  const marks = pageMarks(currentPage, totalPages, slots);

  return (
    <Nav aria-label="글 목록 페이지" className="flex items-center justify-between gap-3">
      {hasPreviousPage ? (
        <Link href={postsListHref(currentPage - 1, sortOrder, keyword)} className={stepClass}>
          이전
        </Link>
      ) : (
        <span className={stepDisabledClass}>이전</span>
      )}
      <ul
        ref={listRef}
        className="flex min-w-0 flex-1 flex-nowrap items-center justify-center gap-2 overflow-hidden"
      >
        {marks.map((mark, index) =>
          mark === "ellipsis" ? (
            <li key={`ellipsis-${index}`} className="shrink-0">
              <span
                aria-hidden="true"
                className="inline-flex h-10 w-10 items-center justify-center text-[14px] font-semibold text-[#9ca3af]"
              >
                …
              </span>
              <span className="sr-only">생략된 페이지</span>
            </li>
          ) : (
            <li key={mark} className="shrink-0">
              {mark === currentPage ? (
                <span aria-current="page" className={currentClass}>
                  {mark}
                </span>
              ) : (
                <Link
                  href={postsListHref(mark, sortOrder, keyword)}
                  aria-label={`${mark}페이지`}
                  className={pageClass}
                >
                  {mark}
                </Link>
              )}
            </li>
          ),
        )}
      </ul>
      {hasNextPage ? (
        <Link href={postsListHref(currentPage + 1, sortOrder, keyword)} className={stepClass}>
          다음
        </Link>
      ) : (
        <span className={stepDisabledClass}>다음</span>
      )}
    </Nav>
  );
}
