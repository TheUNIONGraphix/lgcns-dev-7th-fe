import { cacheLife, cacheTag } from "next/cache";
import { postService, type CommentItem, type PostItem } from "@/service/postService";

export type { CommentItem, PostItem };

export async function getCachedPosts(): Promise<PostItem[]> {
  "use cache";
  cacheTag("posts");
  cacheLife("max");

  console.log(`[post-cache] DB 조회 getCachedPosts ${new Date().toISOString()}`);
  return postService.listPosts();
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
