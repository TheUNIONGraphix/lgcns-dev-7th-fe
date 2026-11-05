"use client";

import Link from "next/link";
import { useOptimistic, useState } from "react";
import { useFormStatus } from "react-dom";
import { createComment, deletePost, toggleLike } from "@/actions/postActions";
import type { PostItem } from "@/lib/postCache";
import "quill/dist/quill.snow.css";

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function excerpt(html: string) {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= 140) return text;
  return `${text.slice(0, 140)}…`;
}

function applyLike(current: { count: number; liked: boolean }, nextLiked: boolean) {
  if (nextLiked === current.liked) return current;
  return {
    liked: nextLiked,
    count: Math.max(0, current.count + (nextLiked ? 1 : -1)),
  };
}

function LikeSubmit({ count, liked }: { count: number; liked: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-pressed={liked}
      className={
        liked
          ? "rounded-lg border border-[#2563eb] bg-[#2563eb] px-3 py-1.5 font-medium text-white disabled:opacity-70"
          : "rounded-lg border border-[#d1d5db] bg-white px-3 py-1.5 font-medium text-[#111827] disabled:opacity-70"
      }
    >
      좋아요 {count}
    </button>
  );
}

function LikeButton({
  postId,
  count,
  liked,
}: {
  postId: string;
  count: number;
  liked: boolean;
}) {
  const [like, setLike] = useOptimistic({ count, liked }, applyLike);

  return (
    <form
      action={async (formData) => {
        setLike(!like.liked);
        await toggleLike(formData);
      }}
    >
      <input type="hidden" name="postId" value={postId} />
      <LikeSubmit count={like.count} liked={like.liked} />
    </form>
  );
}

export default function PostCard({
  post,
  liked = false,
  canManage = false,
  full = false,
}: {
  post: PostItem;
  liked?: boolean;
  canManage?: boolean;
  full?: boolean;
}) {
  const [open, setOpen] = useState(full);
  const html = post.body.trimStart().startsWith("<");

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-[#e5e7eb] bg-white p-5">
      <header className="flex items-baseline justify-between gap-3 text-sm text-[#6b7280]">
        <span className="font-medium text-[#111827]">{post.authorName}</span>
        <time dateTime={post.createdAt}>{formatTime(post.createdAt)}</time>
      </header>
      {full && html ? (
        <div className="ql-snow">
          <div
            className="ql-editor !px-0 !py-0 text-[15px] leading-6 text-[#111827]"
            dangerouslySetInnerHTML={{ __html: post.body }}
          />
        </div>
      ) : (
        <p className="whitespace-pre-wrap text-[15px] leading-6 text-[#111827]">
          {full ? post.body : excerpt(post.body)}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <LikeButton postId={post.id} count={post.likeCount} liked={liked} />
        <span className="text-[#374151]">댓글 {post.commentCount}</span>
        {full ? null : (
          <Link href={`/postdetail/${post.id}`} className="font-medium text-[#2563eb]">
            보기
          </Link>
        )}
        <button
          type="button"
          className="font-medium text-[#2563eb]"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "접기" : "더보기"}
        </button>
        {canManage ? (
          <>
            <Link
              href={`/postwrite?postId=${encodeURIComponent(post.id)}`}
              className="font-medium text-[#111827]"
            >
              수정
            </Link>
            <form
              action={deletePost}
              onSubmit={(event) => {
                if (!window.confirm("이 글을 삭제할까요?")) event.preventDefault();
              }}
            >
              <input type="hidden" name="postId" value={post.id} />
              <button type="submit" className="font-medium text-red-600">
                삭제
              </button>
            </form>
          </>
        ) : null}
      </div>
      {open ? (
        <div className="flex flex-col gap-3 border-t border-[#e5e7eb] pt-3">
          {post.comments.length === 0 ? (
            <p className="text-sm text-[#6b7280]">아직 댓글이 없습니다.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {post.comments.map((comment) => (
                <li key={comment.id} className="text-sm text-[#111827]">
                  <span className="font-medium">{comment.authorName}</span>
                  <span className="ml-2">{comment.body}</span>
                </li>
              ))}
            </ul>
          )}
          <form action={createComment} className="flex gap-2">
            <input type="hidden" name="postId" value={post.id} />
            <input
              name="body"
              required
              maxLength={300}
              placeholder="댓글"
              className="h-10 min-w-0 flex-1 rounded-lg border border-[#d1d5db] bg-white px-3 text-sm text-[#111827] outline-none placeholder:text-[#9ca3af] focus:border-[#2563eb]"
            />
            <button
              type="submit"
              className="h-10 rounded-lg bg-[#111827] px-3 text-sm font-semibold text-white"
            >
              등록
            </button>
          </form>
        </div>
      ) : null}
    </article>
  );
}
