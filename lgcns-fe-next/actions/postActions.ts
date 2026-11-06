"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { readCurrentUser } from "@/lib/currentUser";
import { saveReturnTo } from "@/lib/returnToCookie";
import { postService } from "@/service/postService";

function requestedPath(formData: FormData, fallback: string) {
  const value = formData.get("returnTo");
  return typeof value === "string" && value.trim() ? value : fallback;
}

async function author(formData: FormData, fallback: string) {
  const user = await readCurrentUser();
  if (!user) {
    await saveReturnTo(requestedPath(formData, fallback));
    redirect("/login");
  }
  return user;
}

export async function createPost(formData: FormData) {
  const user = await author(formData, "/posts?compose=new");
  const result = await postService.createPost({
    authorId: user.id,
    authorName: user.name,
    body: String(formData.get("body") ?? ""),
  });
  if (!result.ok) return;
  updateTag("posts");
  redirect(`/postdetail/${result.id}`);
}

export async function updatePost(formData: FormData) {
  const postId = String(formData.get("postId") ?? "");
  const user = await author(
    formData,
    postService.isObjectId(postId)
      ? `/posts?compose=${encodeURIComponent(postId)}`
      : "/posts",
  );
  const result = await postService.updatePost({
    postId,
    authorId: user.id,
    body: String(formData.get("body") ?? ""),
  });
  if (!result.ok) {
    if (result.reason === "invalid") return;
    redirect("/posts");
  }
  updateTag("posts");
  redirect(`/postdetail/${postId}`);
}

export async function deletePost(formData: FormData) {
  const postId = String(formData.get("postId") ?? "");
  const user = await author(
    formData,
    postService.isObjectId(postId) ? `/postdetail/${postId}` : "/posts",
  );
  const result = await postService.deletePost({ postId, authorId: user.id });
  if (!result.ok) redirect("/posts");
  updateTag("posts");
  redirect("/posts");
}

export async function toggleLike(formData: FormData) {
  const postId = String(formData.get("postId") ?? "");
  const user = await author(
    formData,
    postService.isObjectId(postId) ? `/postdetail/${postId}` : "/posts",
  );
  const result = await postService.toggleLike({
    postId,
    userId: user.id,
    actorName: user.name,
  });
  if (!result.ok) return;
  updateTag("posts");
}

export async function toggleCommentLike(formData: FormData) {
  const postId = String(formData.get("postId") ?? "");
  const user = await author(
    formData,
    postService.isObjectId(postId) ? `/postdetail/${postId}` : "/posts",
  );
  const result = await postService.toggleCommentLike({
    commentId: String(formData.get("commentId") ?? ""),
    userId: user.id,
    actorName: user.name,
  });
  if (!result.ok) return;
  updateTag("posts");
}

export async function createComment(formData: FormData) {
  const postId = String(formData.get("postId") ?? "");
  const parentId = String(formData.get("parentId") ?? "");
  const user = await author(
    formData,
    postService.isObjectId(postId) ? `/postdetail/${postId}` : "/posts",
  );
  const result = await postService.createComment({
    postId,
    parentId: parentId || undefined,
    authorId: user.id,
    authorName: user.name,
    body: String(formData.get("body") ?? ""),
  });
  if (!result.ok) return;
  updateTag("posts");
}
