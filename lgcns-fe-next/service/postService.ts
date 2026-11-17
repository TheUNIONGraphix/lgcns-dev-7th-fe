import { postText, sanitizePostHtml } from "@/lib/postHtml";
import { prisma } from "@/lib/prisma";
import type {
  CommentItem,
  CommentReply,
  CommentRow,
  PostItem,
  PostListResponseType,
} from "@/types/response/ResponseType";

export type { CommentItem, CommentReply, PostItem };

const MAX_POST_TEXT = 5000;
const MAX_COMMENT_TEXT = 300;
const MAX_KEYWORD = 100;

function normalizeKeyword(value: string) {
  return value.trim().replace(/\s+/g, " ").slice(0, MAX_KEYWORD);
}


function isObjectId(value: string) {
  return /^[a-f\d]{24}$/i.test(value);
}

function preparePostBody(raw: string) {
  const body = sanitizePostHtml(raw);
  const text = postText(body);
  if (!text || text.length > MAX_POST_TEXT) return null;
  return body;
}

function toReply(comment: CommentRow, likeCount: number): CommentReply {
  return {
    id: comment.id,
    authorName: comment.authorName,
    body: comment.body,
    createdAt: comment.createdAt.toISOString(),
    likeCount,
  };
}

function buildThreads(rows: CommentRow[], likeCount: Map<string, number>): CommentItem[] {
  const topIds = new Set(rows.filter((row) => !row.parentId).map((row) => row.id));
  const replies = new Map<string, CommentReply[]>();
  const threads: CommentItem[] = [];
  for (const row of rows) {
    const item = toReply(row, likeCount.get(row.id) ?? 0);
    if (row.parentId && topIds.has(row.parentId)) {
      const list = replies.get(row.parentId) ?? [];
      list.push(item);
      replies.set(row.parentId, list);
      continue;
    }
    threads.push({ ...item, replies: [] });
  }
  for (const thread of threads) thread.replies = replies.get(thread.id) ?? [];
  return threads;
}

function commentIds(posts: { comments: CommentItem[] }[]) {
  return posts.flatMap((post) =>
    post.comments.flatMap((comment) => [comment.id, ...comment.replies.map((reply) => reply.id)]),
  );
}

async function loadCommentThreads(postIds: string[]) {
  const grouped = new Map<string, { comments: CommentItem[]; count: number }>();
  for (const postId of postIds) grouped.set(postId, { comments: [], count: 0 });
  if (postIds.length === 0) return grouped;

  const rows = await prisma.comment.findMany({
    where: { postId: { in: postIds } },
    orderBy: { createdAt: "asc" },
  });
  const ids = rows.map((row) => row.id);
  const commentLikes =
    ids.length === 0
      ? []
      : await prisma.commentLike.findMany({
          where: { commentId: { in: ids } },
          select: { commentId: true },
        });
  const likeCount = new Map<string, number>();
  for (const like of commentLikes) {
    likeCount.set(like.commentId, (likeCount.get(like.commentId) ?? 0) + 1);
  }

  const byPost = new Map<string, CommentRow[]>();
  for (const row of rows) {
    const list = byPost.get(row.postId) ?? [];
    list.push(row);
    byPost.set(row.postId, list);
  }
  for (const postId of postIds) {
    const list = byPost.get(postId) ?? [];
    grouped.set(postId, { comments: buildThreads(list, likeCount), count: list.length });
  }
  return grouped;
}

async function listPosts(
  pageNumber: number,
  sortOrder: "ASC" | "DESC",
  keyword = "",
): Promise<PostListResponseType> {
  const pageSize = 20;
  const requestedPage = Number.isInteger(pageNumber) && pageNumber > 0 ? pageNumber : 1;
  const normalized = normalizeKeyword(keyword);
  /**
   * 
   * 
   * const response = await fetch('https://api.example.com/posts?page=1&sort=ASC&keyword=test', {
   *    method: 'GET',
   *    headers: {
   *      'Content-Type': 'application/json',
   *      'Authorization': 'Bearer <token>',
   *    },
   * })
   * const data = await response.json();
  **/
  const where = normalized
    ? {
        OR: [
          { authorName: { contains: normalized, mode: "insensitive" as const } },
          { body: { contains: normalized, mode: "insensitive" as const } },
        ],
      }
    : undefined;
  const totalItems = await prisma.post.count({ where });
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / pageSize);
  const currentPage = totalPages === 0 ? 1 : Math.min(requestedPage, totalPages);
  const posts =
    totalItems === 0
      ? []
      : await prisma.post.findMany({
          where,
          orderBy: { createdAt: sortOrder === "ASC" ? "asc" : "desc" },
          skip: (currentPage - 1) * pageSize,
          take: pageSize,
        });

  const ids = posts.map((post) => post.id);
  const [commentThreads, likes] = await Promise.all([
    loadCommentThreads(ids),
    ids.length === 0
      ? Promise.resolve([])
      : prisma.like.findMany({
          where: { postId: { in: ids } },
          select: { postId: true },
        }),
  ]);

  const likeCountByPost = new Map<string, number>();
  for (const like of likes) {
    likeCountByPost.set(like.postId, (likeCountByPost.get(like.postId) ?? 0) + 1);
  }

  return {
    posts: posts.map((post) => {
      const thread = commentThreads.get(post.id);
      return {
        id: post.id,
        authorId: post.authorId,
        authorName: post.authorName,
        body: post.body,
        createdAt: post.createdAt.toISOString(),
        likeCount: likeCountByPost.get(post.id) ?? 0,
        commentCount: thread?.count ?? 0,
        comments: thread?.comments ?? [],
      };
    }),
    totalPages,
    totalItems,
    currentPage,
    pageSize,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
}

async function getPost(postId: string): Promise<PostItem | null> {
  if (!isObjectId(postId)) return null;
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return null;

  const [thread, likes] = await Promise.all([
    loadCommentThreads([postId]),
    prisma.like.findMany({
      where: { postId },
      select: { id: true },
    }),
  ]);
  const comments = thread.get(postId);

  return {
    id: post.id,
    authorId: post.authorId,
    authorName: post.authorName,
    body: post.body,
    createdAt: post.createdAt.toISOString(),
    likeCount: likes.length,
    commentCount: comments?.count ?? 0,
    comments: comments?.comments ?? [],
  };
}

async function createPost(input: {
  authorId: string;
  authorName: string;
  body: string;
}) {
  const body = preparePostBody(input.body);
  if (!body) return { ok: false as const, reason: "invalid" as const };
  const post = await prisma.post.create({
    data: { authorId: input.authorId, authorName: input.authorName, body },
  });
  return { ok: true as const, id: post.id };
}

async function updatePost(input: {
  postId: string;
  authorId: string;
  body: string;
}) {
  const body = preparePostBody(input.body);
  if (!isObjectId(input.postId) || !body) {
    return { ok: false as const, reason: "invalid" as const };
  }
  const post = await prisma.post.findUnique({
    where: { id: input.postId },
    select: { authorId: true },
  });
  if (!post || post.authorId !== input.authorId) {
    return { ok: false as const, reason: "forbidden" as const };
  }
  await prisma.post.update({ where: { id: input.postId }, data: { body } });
  return { ok: true as const, id: input.postId };
}

async function deletePost(input: { postId: string; authorId: string }) {
  if (!isObjectId(input.postId)) {
    return { ok: false as const, reason: "invalid" as const };
  }
  const post = await prisma.post.findUnique({
    where: { id: input.postId },
    select: { authorId: true },
  });
  if (!post || post.authorId !== input.authorId) {
    return { ok: false as const, reason: "forbidden" as const };
  }
  const comments = await prisma.comment.findMany({
    where: { postId: input.postId },
    select: { id: true },
  });
  const commentIdsOnPost = comments.map((comment) => comment.id);
  if (commentIdsOnPost.length > 0) {
    await prisma.commentLike.deleteMany({ where: { commentId: { in: commentIdsOnPost } } });
  }
  await prisma.comment.deleteMany({ where: { postId: input.postId } });
  await prisma.like.deleteMany({ where: { postId: input.postId } });
  await prisma.notification.deleteMany({ where: { postId: input.postId } });
  await prisma.post.delete({ where: { id: input.postId } });
  return { ok: true as const };
}

async function findLikedPostIds(input: { userId: string; postIds: string[] }) {
  const postIds = input.postIds.filter(isObjectId);
  if (!input.userId || postIds.length === 0) return [];
  const likes = await prisma.like.findMany({
    where: { userId: input.userId, postId: { in: postIds } },
    select: { postId: true },
  });
  return likes.map((like) => like.postId);
}

async function findLikedCommentIds(input: { userId: string; commentIds: string[] }) {
  const commentIds = input.commentIds.filter(isObjectId);
  if (!input.userId || commentIds.length === 0) return [];
  const likes = await prisma.commentLike.findMany({
    where: { userId: input.userId, commentId: { in: commentIds } },
    select: { commentId: true },
  });
  return likes.map((like) => like.commentId);
}

async function notifyAuthor(input: {
  postId: string;
  authorId: string;
  actorId: string;
  actorName: string;
  kind: "like" | "comment" | "reply" | "commentLike";
  commentId?: string;
}) {
  if (input.authorId === input.actorId) return;
  await prisma.notification.create({
    data: {
      recipientId: input.authorId,
      actorId: input.actorId,
      actorName: input.actorName,
      kind: input.kind,
      postId: input.postId,
      commentId: input.commentId,
    },
  });
}

async function toggleLike(input: { postId: string; userId: string; actorName: string }) {
  if (!isObjectId(input.postId)) {
    return { ok: false as const, reason: "invalid" as const };
  }
  const existing = await prisma.like.findUnique({
    where: { postId_userId: { postId: input.postId, userId: input.userId } },
  });
  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    await prisma.notification.deleteMany({
      where: { actorId: input.userId, postId: input.postId, kind: "like" },
    });
    return { ok: true as const };
  }
  await prisma.like.create({
    data: { postId: input.postId, userId: input.userId },
  });
  const post = await prisma.post.findUnique({
    where: { id: input.postId },
    select: { authorId: true },
  });
  if (post) {
    await notifyAuthor({
      postId: input.postId,
      authorId: post.authorId,
      actorId: input.userId,
      actorName: input.actorName,
      kind: "like",
    });
  }
  return { ok: true as const };
}

async function toggleCommentLike(input: { commentId: string; userId: string; actorName: string }) {
  if (!isObjectId(input.commentId)) {
    return { ok: false as const, reason: "invalid" as const };
  }
  const comment = await prisma.comment.findUnique({
    where: { id: input.commentId },
    select: { id: true, postId: true, authorId: true },
  });
  if (!comment) return { ok: false as const, reason: "missing" as const };
  const existing = await prisma.commentLike.findUnique({
    where: { commentId_userId: { commentId: comment.id, userId: input.userId } },
  });
  if (existing) {
    await prisma.commentLike.delete({ where: { id: existing.id } });
    await prisma.notification.deleteMany({
      where: { actorId: input.userId, commentId: comment.id, kind: "commentLike" },
    });
    return { ok: true as const };
  }
  await prisma.commentLike.create({
    data: { commentId: comment.id, userId: input.userId },
  });
  await notifyAuthor({
    postId: comment.postId,
    authorId: comment.authorId,
    actorId: input.userId,
    actorName: input.actorName,
    kind: "commentLike",
    commentId: comment.id,
  });
  return { ok: true as const };
}

async function createComment(input: {
  postId: string;
  authorId: string;
  authorName: string;
  body: string;
  parentId?: string;
}) {
  const body = input.body.trim();
  const parentId = input.parentId?.trim() ?? "";
  if (!isObjectId(input.postId) || !body || body.length > MAX_COMMENT_TEXT) {
    return { ok: false as const, reason: "invalid" as const };
  }
  if (parentId && !isObjectId(parentId)) {
    return { ok: false as const, reason: "invalid" as const };
  }
  const post = await prisma.post.findUnique({
    where: { id: input.postId },
    select: { id: true, authorId: true },
  });
  if (!post) return { ok: false as const, reason: "missing" as const };

  let parentAuthorId: string | null = null;
  if (parentId) {
    const parent = await prisma.comment.findUnique({
      where: { id: parentId },
      select: { postId: true, authorId: true, parentId: true },
    });
    if (!parent || parent.postId !== post.id || parent.parentId) {
      return { ok: false as const, reason: "invalid" as const };
    }
    parentAuthorId = parent.authorId;
  }

  await prisma.comment.create({
    data: {
      postId: input.postId,
      parentId: parentId || null,
      authorId: input.authorId,
      authorName: input.authorName,
      body,
    },
  });
  if (parentAuthorId && parentAuthorId !== input.authorId) {
    await notifyAuthor({
      postId: input.postId,
      authorId: parentAuthorId,
      actorId: input.authorId,
      actorName: input.authorName,
      kind: "reply",
      commentId: parentId,
    });
  }
  if (post.authorId !== input.authorId && post.authorId !== parentAuthorId) {
    await notifyAuthor({
      postId: input.postId,
      authorId: post.authorId,
      actorId: input.authorId,
      actorName: input.authorName,
      kind: "comment",
    });
  }
  return { ok: true as const };
}

export const postService = {
  isObjectId,
  normalizeKeyword,
  listPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  commentIds,
  findLikedPostIds,
  findLikedCommentIds,
  toggleLike,
  toggleCommentLike,
  createComment,
};
