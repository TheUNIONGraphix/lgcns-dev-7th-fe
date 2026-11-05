import { cacheLife, cacheTag } from "next/cache";
import { postService, type CommentItem, type PostItem } from "@/service/postService";
import type { PostListResponseType } from "@/types/response/ResponseType";

export type { CommentItem, PostItem, PostListResponseType };

export async function getCachedPosts(
  pageNumber: number,
  sortOrder: "ASC" | "DESC",
): Promise<PostListResponseType> {
  "use cache";
  cacheTag("posts");
  cacheLife("max");

  console.log(`[post-cache] DB 조회 getCachedPosts ${new Date().toISOString()}`);
  return postService.listPosts(pageNumber, sortOrder);
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
