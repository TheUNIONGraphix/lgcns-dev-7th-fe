import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import {
  createComment,
  deletePost,
  toggleCommentLike,
  toggleLike,
  type CommentReply,
  type PostItem,
} from "../lib/posts";

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

export default function PostCard({
  post,
  liked = false,
  likedCommentIds = [],
  canManage = false,
  full = false,
  onChange,
  onDeleted,
}: {
  post: PostItem;
  liked?: boolean;
  likedCommentIds?: string[];
  canManage?: boolean;
  full?: boolean;
  onChange: () => void;
  onDeleted?: () => void;
}) {
  const [open, setOpen] = useState(full);
  const [comment, setComment] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [reply, setReply] = useState("");
  const [pending, setPending] = useState(false);
  const likedComments = new Set(likedCommentIds);
  const html = post.body.trimStart().startsWith("<");

  const like = async () => {
    setPending(true);
    try {
      await toggleLike(post.id);
      onChange();
    } finally {
      setPending(false);
    }
  };

  const remove = async () => {
    if (!window.confirm("이 글을 삭제할까요?")) return;
    setPending(true);
    try {
      await deletePost(post.id);
      if (onDeleted) onDeleted();
      else onChange();
    } finally {
      setPending(false);
    }
  };

  const sendComment = async (event: FormEvent) => {
    event.preventDefault();
    setPending(true);
    try {
      await createComment(post.id, comment);
      setComment("");
      onChange();
    } finally {
      setPending(false);
    }
  };

  const likeComment = async (commentId: string) => {
    setPending(true);
    try {
      await toggleCommentLike(post.id, commentId);
      onChange();
    } finally {
      setPending(false);
    }
  };

  const sendReply = async (event: FormEvent, parentId: string) => {
    event.preventDefault();
    setPending(true);
    try {
      await createComment(post.id, reply, parentId);
      setReply("");
      setReplyTo("");
      onChange();
    } finally {
      setPending(false);
    }
  };

  const commentLine = (item: CommentReply, nested = false) => (
    <li key={item.id} className="flex flex-col gap-2 text-sm text-[#111827]">
      <p>
        <span className="font-medium">{item.authorName}</span>
        <span className="ml-2">{item.body}</span>
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={pending}
          aria-pressed={likedComments.has(item.id)}
          className={
            likedComments.has(item.id)
              ? "rounded-lg border border-[#2563eb] bg-[#2563eb] px-2 py-1 text-xs font-medium text-white disabled:opacity-70"
              : "rounded-lg border border-[#d1d5db] bg-white px-2 py-1 text-xs font-medium text-[#111827] disabled:opacity-70"
          }
          onClick={() => void likeComment(item.id)}
        >
          좋아요 {item.likeCount}
        </button>
        {nested ? null : (
          <button
            type="button"
            className="text-xs font-medium text-[#2563eb]"
            onClick={() => {
              setReplyTo(item.id);
              setReply("");
            }}
          >
            답글
          </button>
        )}
      </div>
      {!nested && replyTo === item.id ? (
        <form className="flex gap-2" onSubmit={(event) => void sendReply(event, item.id)}>
          <input
            required
            maxLength={300}
            placeholder="답글"
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            className="h-8 min-w-0 flex-1 rounded-lg border border-[#d1d5db] bg-white px-3 text-xs text-[#111827] outline-none placeholder:text-[#9ca3af] focus:border-[#2563eb]"
          />
          <button
            type="submit"
            disabled={pending}
            className="h-8 rounded-lg bg-[#111827] px-3 text-xs font-semibold text-white"
          >
            등록
          </button>
        </form>
      ) : null}
    </li>
  );

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-[#e5e7eb] bg-white p-5">
      <header className="flex items-baseline justify-between gap-3 text-sm text-[#6b7280]">
        <span className="font-medium text-[#111827]">{post.authorName}</span>
        <time dateTime={post.createdAt}>{formatTime(post.createdAt)}</time>
      </header>
      {full && html ? (
        <div
          className="ql-editor px-0 py-0 text-[15px] leading-6 text-[#111827]"
          dangerouslySetInnerHTML={{ __html: post.body }}
        />
      ) : (
        <p className="whitespace-pre-wrap text-[15px] leading-6 text-[#111827]">
          {full ? post.body : excerpt(post.body)}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <button
          type="button"
          disabled={pending}
          aria-pressed={liked}
          className={
            liked
              ? "rounded-lg border border-[#2563eb] bg-[#2563eb] px-3 py-1.5 font-medium text-white disabled:opacity-70"
              : "rounded-lg border border-[#d1d5db] bg-white px-3 py-1.5 font-medium text-[#111827] disabled:opacity-70"
          }
          onClick={like}
        >
          좋아요 {post.likeCount}
        </button>
        <span className="text-[#374151]">댓글 {post.commentCount}</span>
        {full ? null : (
          <Link to={`/postdetail/${post.id}`} className="font-medium text-[#2563eb]">
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
              to={`/postwrite?postId=${encodeURIComponent(post.id)}`}
              className="font-medium text-[#111827]"
            >
              수정
            </Link>
            <button type="button" className="font-medium text-red-600" onClick={remove}>
              삭제
            </button>
          </>
        ) : null}
      </div>
      {open ? (
        <div className="flex flex-col gap-3 border-t border-[#e5e7eb] pt-3">
          {post.comments.length === 0 ? (
            <p className="text-sm text-[#6b7280]">아직 댓글이 없습니다.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {post.comments.map((item) => (
                <li key={item.id}>
                  <ul className="flex flex-col gap-2">
                    {commentLine(item)}
                    {(item.replies ?? []).length > 0 ? (
                      <ul className="ml-6 flex flex-col gap-2 border-l border-[#e5e7eb] pl-3">
                        {item.replies.map((reply) => commentLine(reply, true))}
                      </ul>
                    ) : null}
                  </ul>
                </li>
              ))}
            </ul>
          )}
          <form className="flex gap-2" onSubmit={sendComment}>
            <input
              required
              maxLength={300}
              placeholder="댓글"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              className="h-10 min-w-0 flex-1 rounded-lg border border-[#d1d5db] bg-white px-3 text-sm text-[#111827] outline-none placeholder:text-[#9ca3af] focus:border-[#2563eb]"
            />
            <button
              type="submit"
              disabled={pending}
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
