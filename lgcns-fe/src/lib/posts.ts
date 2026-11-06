import { apiBaseUrl } from "./env";
import { readAccessToken } from "./auth";

export type CommentReply = {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
  likeCount: number;
};

export type CommentItem = CommentReply & {
  replies: CommentReply[];
};

export type PostItem = {
  id: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  comments: CommentItem[];
};

export type PostListData = {
  posts: PostItem[];
  totalPages: number;
  totalItems: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  viewerId: string | null;
  likedPostIds: string[];
  likedCommentIds: string[];
};

function authHeaders() {
  const token = readAccessToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function readJson<T>(response: Response) {
  const data = (await response.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
    data?: T;
  } | null;
  if (!response.ok || !data?.success) {
    throw new Error(data?.message ?? "요청에 실패했습니다.");
  }
  return data.data as T;
}

export function fetchPosts(page: number, sort: "ASC" | "DESC", keyword = "") {
  const params = new URLSearchParams({ page: String(page), sort });
  if (keyword) params.set("q", keyword);
  return fetch(`${apiBaseUrl}/api/posts?${params.toString()}`, {
    headers: authHeaders(),
  }).then((response) => readJson<PostListData>(response));
}

export function fetchPost(postId: string) {
  return fetch(`${apiBaseUrl}/api/posts/${postId}`, {
    headers: authHeaders(),
  }).then((response) =>
    readJson<{ post: PostItem; liked: boolean; likedCommentIds: string[]; canManage: boolean }>(
      response,
    ),
  );
}

export function createPost(body: string) {
  return fetch(`${apiBaseUrl}/api/posts`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ body }),
  }).then((response) => readJson<{ id: string }>(response));
}

export function updatePost(postId: string, body: string) {
  return fetch(`${apiBaseUrl}/api/posts/${postId}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ body }),
  }).then((response) => readJson<unknown>(response));
}

export function deletePost(postId: string) {
  return fetch(`${apiBaseUrl}/api/posts/${postId}`, {
    method: "DELETE",
    headers: authHeaders(),
  }).then((response) => readJson<unknown>(response));
}

export function createComment(postId: string, body: string, parentId?: string) {
  return fetch(`${apiBaseUrl}/api/posts/${postId}/comments`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ body, parentId }),
  }).then((response) => readJson<unknown>(response));
}

export function toggleCommentLike(postId: string, commentId: string) {
  return fetch(`${apiBaseUrl}/api/posts/${postId}/comments/${commentId}/like`, {
    method: "POST",
    headers: authHeaders(),
  }).then((response) => readJson<unknown>(response));
}

export function toggleLike(postId: string) {
  return fetch(`${apiBaseUrl}/api/posts/${postId}/like`, {
    method: "POST",
    headers: authHeaders(),
  }).then((response) => readJson<unknown>(response));
}
