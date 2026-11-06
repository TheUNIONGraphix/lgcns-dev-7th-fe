"use client";

import { useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { createComment, deletePost, toggleCommentLike, toggleLike } from "@/actions/postActions";
import { rememberReturnPath } from "@/actions/returnToActions";
import { useAuth } from "@/component/providers/AuthProvider";
import type { PostItem } from "@/lib/postCache";
import PostCommentCount from "../atoms/PostCommentCount";
import PostInlineLink from "../atoms/PostInlineLink";
import PostBody from "../molecules/PostBody";
import CommentLikeForm from "../molecules/CommentLikeForm";
import PostCommentForm from "../molecules/PostCommentForm";
import PostCommentItem from "../molecules/PostCommentItem";
import ReplyForm from "../molecules/ReplyForm";
import PostDeleteForm from "../molecules/PostDeleteForm";
import LoginRequiredDialog from "../molecules/LoginRequiredDialog";
import PostLikeForm from "../molecules/PostLikeForm";
import PostMeta from "../molecules/PostMeta";

export default function PostCard({
  post,
  liked = false,
  likedCommentIds = [],
  canManage = false,
  full = false,
}: {
  post: PostItem;
  liked?: boolean;
  likedCommentIds?: string[];
  canManage?: boolean;
  full?: boolean;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const messageRef = useRef<HTMLParagraphElement>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isLoggedIn } = useAuth();
  const likedComments = new Set(likedCommentIds);
  const editParams = new URLSearchParams(searchParams.toString());
  editParams.set("compose", post.id);
  const editHref = `${pathname}?${editParams.toString()}`;

  const allow = (message: string) => {
    if (isLoggedIn) return true;
    if (messageRef.current) messageRef.current.textContent = message;
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    return false;
  };

  const goLogin = () => {
    const formData = new FormData();
    formData.set("returnTo", `${window.location.pathname}${window.location.search}`);
    void rememberReturnPath(formData);
  };

  const comments =
    post.comments.length === 0 ? (
      <p className="text-sm text-[#6b7280]">아직 댓글이 없습니다.</p>
    ) : (
      <ul className="flex flex-col gap-3">
        {post.comments.map((comment) => (
          <li key={comment.id} className="flex flex-col gap-2 rounded-2xl bg-white px-4 py-3">
            <PostCommentItem authorName={comment.authorName} body={comment.body} />
            <div className="flex flex-wrap items-center gap-2">
              <CommentLikeForm
                postId={post.id}
                commentId={comment.id}
                count={comment.likeCount}
                liked={likedComments.has(comment.id)}
                action={toggleCommentLike}
                onBeforeSubmit={() => allow("댓글 좋아요는 로그인 후 이용할 수 있어요.")}
              />
              <ReplyForm
                postId={post.id}
                parentId={comment.id}
                action={createComment}
                onBeforeSubmit={() => allow("답글은 로그인 후 이용할 수 있어요.")}
              />
            </div>
            {comment.replies.length > 0 ? (
              <ul className="ml-3 flex flex-col gap-3 border-l-2 border-[#dbeafe] pl-3">
                {comment.replies.map((reply) => (
                  <li key={reply.id} className="flex flex-col gap-2">
                    <PostCommentItem authorName={reply.authorName} body={reply.body} />
                    <CommentLikeForm
                      postId={post.id}
                      commentId={reply.id}
                      count={reply.likeCount}
                      liked={likedComments.has(reply.id)}
                      action={toggleCommentLike}
                      onBeforeSubmit={() => allow("댓글 좋아요는 로그인 후 이용할 수 있어요.")}
                    />
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    );

  return (
    <article className="flex flex-col gap-5 rounded-3xl border border-[#e5e7eb] bg-white px-5 py-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:px-7 sm:py-6">
      <PostMeta authorName={post.authorName} createdAt={post.createdAt} />
      <PostBody body={post.body} full={full} />
      <div className="group/comments flex flex-col gap-4 border-t border-[#f3f4f6] pt-4 text-sm">
        <input
          id={`comments-${post.id}`}
          type="checkbox"
          defaultChecked={full}
          className="comments-toggle sr-only"
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <PostLikeForm
              postId={post.id}
              count={post.likeCount}
              liked={liked}
              action={toggleLike}
              onBeforeSubmit={() => allow("좋아요는 로그인 후 이용할 수 있어요.")}
            />
            <PostCommentCount count={post.commentCount} htmlFor={`comments-${post.id}`} />
          </div>
          <div className="flex items-center gap-3">
            {full ? null : <PostInlineLink href={`/postdetail/${post.id}`}>보기</PostInlineLink>}
            {canManage ? (
              <>
                <PostInlineLink href={editHref} tone="default">
                  수정
                </PostInlineLink>
                <PostDeleteForm postId={post.id} action={deletePost} />
              </>
            ) : null}
          </div>
        </div>
        <LoginRequiredDialog dialogRef={dialogRef} messageRef={messageRef} onLogin={goLogin} />
        <div className="hidden flex-col gap-4 rounded-2xl bg-[#f8fafc] p-4 group-has-[.comments-toggle:checked]/comments:flex">
          {comments}
          <PostCommentForm postId={post.id} action={createComment} />
        </div>
      </div>
    </article>
  );
}
