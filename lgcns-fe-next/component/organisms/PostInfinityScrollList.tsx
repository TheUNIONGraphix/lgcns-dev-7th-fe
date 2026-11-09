"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { PostItem, PostListResponseType } from "@/types/response/ResponseType";
import { postsListHref } from "@/lib/postsListHref";
import { Section } from "@/components/ui/landmark";
import PostCard from "./PostCard";

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
  const endOfListRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const [postList, setPostList] = useState<PostItem[]>(posts.posts);
  const [hasMorePosts, setHasMorePosts] = useState(posts.hasNextPage);
  const [trackedPage, setTrackedPage] = useState(pageNumber);
  const [trackedQuery, setTrackedQuery] = useState(`${sortOrder}:${keyword}`);
  const [trackedPageKey, setTrackedPageKey] = useState(posts.posts.map((post) => post.id).join("\n"));
  const queryKey = `${sortOrder}:${keyword}`;
  const pageKey = posts.posts.map((post) => post.id).join("\n");

  if (queryKey !== trackedQuery || pageNumber < trackedPage) {
    setTrackedQuery(queryKey);
    setTrackedPage(pageNumber);
    setTrackedPageKey(pageKey);
    setPostList(posts.posts);
    setHasMorePosts(posts.hasNextPage);
  } else if (pageNumber > trackedPage) {
    setTrackedPage(pageNumber);
    setTrackedPageKey(pageKey);
    setPostList((prev) => {
      const seen = new Set(prev.map((post) => post.id));
      const next = posts.posts.filter((post) => !seen.has(post.id));
      return next.length > 0 ? [...prev, ...next] : prev;
    });
    setHasMorePosts(posts.hasNextPage);
  } else if (pageNumber === 1 && pageKey !== trackedPageKey) {
    setTrackedPageKey(pageKey);
    setPostList(posts.posts);
    setHasMorePosts(posts.hasNextPage);
  }

  useEffect(() => {
    loadingRef.current = false;
    const node = endOfListRef.current;
    if (!node || !hasMorePosts) return;

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting) || loadingRef.current) return;
      loadingRef.current = true;
      router.push(postsListHref(pageNumber + 1, sortOrder, keyword), { scroll: false });
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMorePosts, keyword, pageNumber, router, sortOrder]);

  return (
    <Section>
      <ul className="flex flex-col gap-4">
        {postList.map((post) => (
          <li key={post.id}>
            <PostCard post={post} />
          </li>
        ))}
      </ul>
      {hasMorePosts ? (
        <div ref={endOfListRef} className="mt-10 h-10 w-full bg-red-500">
          데이터 로딩중...
        </div>
      ) : null}
    </Section>
  );
}
