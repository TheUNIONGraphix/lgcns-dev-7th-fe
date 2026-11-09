"use client";

import { useMemo, useState } from "react";
import { createPostPageWindow, reducePostPageWindow } from "@/lib/postPageWindow";
import { Section } from "@/components/ui/landmark";
import type { PostListShellProps } from "./postListShell";
import PostCard from "./PostCard";
import { useAdjacentPostPage } from "./useAdjacentPostPage";
import { usePreservePrependScroll } from "./usePreservePrependScroll";
import { useVisiblePostPage } from "./useVisiblePostPage";

export default function PostInfinityScrollList({
  posts,
  pageNumber,
  sortOrder,
  keyword,
}: PostListShellProps) {
  const [windowState, setWindowState] = useState(() =>
    createPostPageWindow(posts, pageNumber, sortOrder, keyword),
  );
  const view = reducePostPageWindow(windowState, posts, pageNumber, sortOrder, keyword);
  if (view !== windowState) setWindowState(view);

  const firstPage = view.groups[0]?.page ?? pageNumber;
  const lastPage = view.groups[view.groups.length - 1]?.page ?? pageNumber;
  const loadedPages = useMemo(() => view.groups.map((group) => group.page), [view.groups]);
  const { topRef, bottomRef } = useAdjacentPostPage({
    firstPage,
    lastPage,
    hasNextPage: view.hasNextPage,
    hasPreviousPage: view.hasPreviousPage,
    sortOrder,
    keyword,
  });
  usePreservePrependScroll(firstPage, loadedPages);
  const visiblePage = useVisiblePostPage(view.anchorPage);

  return (
    <Section>
      {view.hasPreviousPage ? (
        <div ref={topRef} className="mb-4 h-10 w-full text-center text-sm text-[#6b7280]">
          이전 글을 불러오는 중...
        </div>
      ) : null}
      <div className="flex flex-col gap-4">
        {view.groups.map((group) => (
          <div key={group.page} data-post-page={group.page}>
            <ul className="flex flex-col gap-4">
              {group.posts.map((post) => (
                <li key={post.id}>
                  <PostCard post={post} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {view.hasNextPage ? (
        <div ref={bottomRef} className="mt-10 h-10 w-full bg-red-500">
          데이터 로딩중...
        </div>
      ) : null}
      <div className="fixed bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-full bg-[#111827] px-4 py-2 text-sm font-semibold text-white">
        {visiblePage}페이지{view.totalPages > 0 ? ` / ${view.totalPages}` : ""}
      </div>
    </Section>
  );
}
