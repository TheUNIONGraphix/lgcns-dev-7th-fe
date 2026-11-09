"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { PostItem, PostListResponseType } from "@/types/response/ResponseType";
import { postsListHref } from "@/lib/postsListHref";
import { Section } from "@/components/ui/landmark";
import PostCard from "./PostCard";

type PageGroup = {
  page: number;
  posts: PostItem[];
};

export default function PostInfinityScrollList({
  posts,
  pageNumber,
  sortOrder = "DESC",
  keyword = "",
}: {
  posts: PostListResponseType;
  pageNumber: number;
  sortOrder?: "ASC" | "DESC";
  keyword?: string;
}) {
  const router = useRouter();
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const armPreviousRef = useRef(false);
  const firstPageRef = useRef(pageNumber);
  const scrollHeightRef = useRef(0);
  const lastScrollYRef = useRef(0);
  const [groups, setGroups] = useState<PageGroup[]>([{ page: pageNumber, posts: posts.posts }]);
  const [hasMorePosts, setHasMorePosts] = useState(posts.hasNextPage);
  const [hasPreviousPosts, setHasPreviousPosts] = useState(posts.hasPreviousPage);
  const [totalPages, setTotalPages] = useState(posts.totalPages);
  const [visiblePage, setVisiblePage] = useState(pageNumber);
  const [trackedQuery, setTrackedQuery] = useState(`${sortOrder}:${keyword}`);
  const [loadedKey, setLoadedKey] = useState(
    `${pageNumber}:${posts.posts.map((post) => post.id).join("\n")}`,
  );
  const queryKey = `${sortOrder}:${keyword}`;
  const pageKey = posts.posts.map((post) => post.id).join("\n");
  const requestKey = `${pageNumber}:${pageKey}`;
  const firstPage = groups[0]?.page ?? pageNumber;
  const lastPage = groups[groups.length - 1]?.page ?? pageNumber;

  if (queryKey !== trackedQuery) {
    setTrackedQuery(queryKey);
    setLoadedKey(requestKey);
    setGroups([{ page: pageNumber, posts: posts.posts }]);
    setHasMorePosts(posts.hasNextPage);
    setHasPreviousPosts(posts.hasPreviousPage);
    setTotalPages(posts.totalPages);
    setVisiblePage(pageNumber);
  } else if (requestKey !== loadedKey) {
    setLoadedKey(requestKey);
    setTotalPages(posts.totalPages);
    if (groups.some((group) => group.page === pageNumber)) {
      setGroups((current) =>
        current.map((group) =>
          group.page === pageNumber ? { page: pageNumber, posts: posts.posts } : group,
        ),
      );
      if (pageNumber === firstPage) setHasPreviousPosts(posts.hasPreviousPage);
      if (pageNumber === lastPage) setHasMorePosts(posts.hasNextPage);
    } else if (pageNumber === lastPage + 1) {
      setGroups((current) => [...current, { page: pageNumber, posts: posts.posts }]);
      setHasMorePosts(posts.hasNextPage);
    } else if (pageNumber === firstPage - 1) {
      setGroups((current) => [{ page: pageNumber, posts: posts.posts }, ...current]);
      setHasPreviousPosts(posts.hasPreviousPage);
    } else {
      setGroups([{ page: pageNumber, posts: posts.posts }]);
      setHasMorePosts(posts.hasNextPage);
      setHasPreviousPosts(posts.hasPreviousPage);
      setVisiblePage(pageNumber);
    }
  }

  useLayoutEffect(() => {
    const nextHeight = document.documentElement.scrollHeight;
    const prepended =
      firstPage < firstPageRef.current &&
      groups.some((group) => group.page === firstPageRef.current);
    if (prepended && scrollHeightRef.current > 0) {
      window.scrollBy(0, nextHeight - scrollHeightRef.current);
    }
    firstPageRef.current = firstPage;
    scrollHeightRef.current = document.documentElement.scrollHeight;
  }, [firstPage, groups]);

  useEffect(() => {
    loadingRef.current = false;
    const top = topRef.current;
    const bottom = bottomRef.current;
    const observer = new IntersectionObserver((entries) => {
      if (loadingRef.current) return;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        if (entry.target === top) {
          if (!armPreviousRef.current || !hasPreviousPosts || firstPage <= 1) continue;
          armPreviousRef.current = false;
          loadingRef.current = true;
          router.push(postsListHref(firstPage - 1, sortOrder, keyword), { scroll: false });
          return;
        }
        if (entry.target === bottom && hasMorePosts) {
          loadingRef.current = true;
          router.push(postsListHref(lastPage + 1, sortOrder, keyword), { scroll: false });
          return;
        }
      }
    });

    if (top && hasPreviousPosts) observer.observe(top);
    if (bottom && hasMorePosts) observer.observe(bottom);
    return () => observer.disconnect();
  }, [firstPage, hasMorePosts, hasPreviousPosts, keyword, lastPage, router, sortOrder]);

  useEffect(() => {
    const updateVisiblePage = () => {
      const nodes = document.querySelectorAll<HTMLElement>("[data-post-page]");
      const line = window.innerHeight * 0.35;
      let current = Number(nodes[0]?.dataset.postPage ?? pageNumber);
      nodes.forEach((node) => {
        if (node.getBoundingClientRect().top <= line) {
          current = Number(node.dataset.postPage);
        }
      });
      if (Number.isInteger(current) && current > 0) {
        setVisiblePage((prev) => (prev === current ? prev : current));
      }
    };

    const requestPrevious = () => {
      armPreviousRef.current = true;
      const node = topRef.current;
      if (!node || loadingRef.current || !hasPreviousPosts || firstPage <= 1) return;
      const rect = node.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;
      armPreviousRef.current = false;
      loadingRef.current = true;
      router.push(postsListHref(firstPage - 1, sortOrder, keyword), { scroll: false });
    };

    const onScroll = () => {
      const y = window.scrollY;
      if (y < lastScrollYRef.current) requestPrevious();
      lastScrollYRef.current = y;
      updateVisiblePage();
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
  }, [firstPage, hasPreviousPosts, keyword, pageNumber, router, sortOrder]);

  return (
    <Section>
      {hasPreviousPosts ? (
        <div ref={topRef} className="mb-4 h-10 w-full text-center text-sm text-[#6b7280]">
          이전 글을 불러오는 중...
        </div>
      ) : null}
      <div className="flex flex-col gap-4">
        {groups.map((group) => (
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
      {hasMorePosts ? (
        <div ref={bottomRef} className="mt-10 h-10 w-full bg-red-500">
          데이터 로딩중...
        </div>
      ) : null}
      <div className="fixed bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-full bg-[#111827] px-4 py-2 text-sm font-semibold text-white">
        {visiblePage}페이지{totalPages > 0 ? ` / ${totalPages}` : ""}
      </div>
    </Section>
  );
}
