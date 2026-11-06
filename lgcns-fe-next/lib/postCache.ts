import { cacheLife, cacheTag } from "next/cache";
import { postService, type CommentItem, type PostItem } from "@/service/postService";
import type { PostListResponseType } from "@/types/response/ResponseType";

export type { CommentItem, PostItem, PostListResponseType };

export function normalizePostKeyword(value: string) {
  return postService.normalizeKeyword(value);
}

export function postsListHref(
  page: number,
  sortOrder: "ASC" | "DESC",
  keyword: string,
) {
  const params = new URLSearchParams({
    page: String(page),
    sort: sortOrder,
  });
  if (keyword) params.set("q", keyword);
  return `/posts?${params.toString()}`;
}

export async function getCachedPosts(
  pageNumber: number,
  sortOrder: "ASC" | "DESC",
  keyword = "",
): Promise<PostListResponseType> {
  "use cache";
  cacheTag("posts");
  cacheLife("max");

  console.log(
    `[post-cache] DB 조회 getCachedPosts page=${pageNumber} sort=${sortOrder} q=${keyword} ${new Date().toISOString()}`,
  );
  return postService.listPosts(pageNumber, sortOrder, keyword);
}

export async function findViewerLikedPostIds(userId: string, postIds: string[]) {
  return postService.findLikedPostIds({ userId, postIds });
}

export async function getCachedPost(postId: string): Promise<PostItem | null> {
  "use cache";
  cacheTag("posts");
  cacheLife("max");

  console.log(
    `[post-cache] DB 조회 getCachedPost ${postId} ${new Date().toISOString()}`,
  );
  return postService.getPost(postId);
}
