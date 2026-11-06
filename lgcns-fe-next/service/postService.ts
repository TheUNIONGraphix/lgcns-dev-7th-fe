import { postText, sanitizePostHtml } from "@/lib/postHtml";
import { prisma } from "@/lib/prisma";
import type { PostListResponseType } from "@/types/response/ResponseType";

const MAX_POST_TEXT = 5000;
const MAX_COMMENT_TEXT = 300;
const MAX_KEYWORD = 100;

function normalizeKeyword(value: string) {
  return value.trim().replace(/\s+/g, " ").slice(0, MAX_KEYWORD);
}

export type CommentItem = {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
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

function isObjectId(value: string) {
  return /^[a-f\d]{24}$/i.test(value);
}

function preparePostBody(raw: string) {
  const body = sanitizePostHtml(raw);
  const text = postText(body);
  if (!text || text.length > MAX_POST_TEXT) return null;
  return body;
}

function toComment(comment: {
  id: string;
  authorName: string;
  body: string;
  createdAt: Date;
}): CommentItem {
  return {
    id: comment.id,
    authorName: comment.authorName,
    body: comment.body,
    createdAt: comment.createdAt.toISOString(),
  };
}

async function listPosts(
  pageNumber: number,
  sortOrder: "ASC" | "DESC",
  keyword = "",
): Promise<PostListResponseType> {
  const pageSize = 20;
  const requestedPage = Number.isInteger(pageNumber) && pageNumber > 0 ? pageNumber : 1;
  const normalized = normalizeKeyword(keyword);
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
  const [comments, likes] =
    ids.length === 0
      ? [[], []]
      : await Promise.all([
          prisma.comment.findMany({
            where: { postId: { in: ids } },
            orderBy: { createdAt: "asc" },
          }),
          prisma.like.findMany({
            where: { postId: { in: ids } },
            select: { postId: true },
          }),
        ]);

  const commentsByPost = new Map<string, CommentItem[]>();
  for (const comment of comments) {
    const list = commentsByPost.get(comment.postId) ?? [];
    list.push(toComment(comment));
    commentsByPost.set(comment.postId, list);
  }

  const likeCountByPost = new Map<string, number>();
  for (const like of likes) {
    likeCountByPost.set(like.postId, (likeCountByPost.get(like.postId) ?? 0) + 1);
  }

  return {
    posts: posts.map((post) => {
      const postComments = commentsByPost.get(post.id) ?? [];
      return {
        id: post.id,
        authorId: post.authorId,
        authorName: post.authorName,
        body: post.body,
        createdAt: post.createdAt.toISOString(),
        likeCount: likeCountByPost.get(post.id) ?? 0,
        commentCount: postComments.length,
        comments: postComments,
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

  const [comments, likes] = await Promise.all([
    prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.like.findMany({
      where: { postId },
      select: { id: true },
    }),
  ]);

  return {
    id: post.id,
    authorId: post.authorId,
    authorName: post.authorName,
    body: post.body,
    createdAt: post.createdAt.toISOString(),
    likeCount: likes.length,
    commentCount: comments.length,
    comments: comments.map(toComment),
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

async function notifyAuthor(input: {
  postId: string;
  authorId: string;
  actorId: string;
  actorName: string;
  kind: "like" | "comment";
}) {
  if (input.authorId === input.actorId) return;
  await prisma.notification.create({
    data: {
      recipientId: input.authorId,
      actorId: input.actorId,
      actorName: input.actorName,
      kind: input.kind,
      postId: input.postId,
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

async function createComment(input: {
  postId: string;
  authorId: string;
  authorName: string;
  body: string;
}) {
  const body = input.body.trim();
  if (!isObjectId(input.postId) || !body || body.length > MAX_COMMENT_TEXT) {
    return { ok: false as const, reason: "invalid" as const };
  }
  const post = await prisma.post.findUnique({
    where: { id: input.postId },
    select: { id: true, authorId: true },
  });
  if (!post) return { ok: false as const, reason: "missing" as const };
  await prisma.comment.create({
    data: {
      postId: input.postId,
      authorId: input.authorId,
      authorName: input.authorName,
      body,
    },
  });
  await notifyAuthor({
    postId: input.postId,
    authorId: post.authorId,
    actorId: input.authorId,
    actorName: input.authorName,
    kind: "comment",
  });
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
  findLikedPostIds,
  toggleLike,
  createComment,
};
