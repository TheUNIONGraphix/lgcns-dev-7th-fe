"use client";

import { useState } from "react";
import { createComment, deletePost, toggleLike } from "@/actions/postActions";
import { rememberReturnPath } from "@/actions/returnToActions";
import { useAuth } from "@/component/providers/AuthProvider";
import type { PostItem } from "@/lib/postCache";
import PostCommentCount from "../atoms/PostCommentCount";
import PostInlineLink from "../atoms/PostInlineLink";
import PostTextButton from "../atoms/PostTextButton";
import PostBody from "../molecules/PostBody";
import PostCommentForm from "../molecules/PostCommentForm";
import PostCommentItem from "../molecules/PostCommentItem";
import PostDeleteForm from "../molecules/PostDeleteForm";
import LoginRequiredDialog from "../molecules/LoginRequiredDialog";
import PostLikeForm from "../molecules/PostLikeForm";
import PostMeta from "../molecules/PostMeta";

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
  const [loginOpen, setLoginOpen] = useState(false);
  const { isLoggedIn } = useAuth();

  const allowLike = () => {
    if (isLoggedIn) return true;
    setLoginOpen(true);
    return false;
  };

  const goLogin = () => {
    const formData = new FormData();
    formData.set("returnTo", `${window.location.pathname}${window.location.search}`);
    void rememberReturnPath(formData);
  };

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-[#e5e7eb] bg-white p-5">
      <PostMeta authorName={post.authorName} createdAt={post.createdAt} />
      <PostBody body={post.body} full={full} />
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <PostLikeForm
          postId={post.id}
          count={post.likeCount}
          liked={liked}
          action={toggleLike}
          onBeforeSubmit={allowLike}
        />
        <PostCommentCount count={post.commentCount} />
        {full ? null : <PostInlineLink href={`/postdetail/${post.id}`}>보기</PostInlineLink>}
        <PostTextButton pressed={open} onClick={() => setOpen((value) => !value)}>
          {open ? "접기" : "더보기"}
        </PostTextButton>
        {canManage ? (
          <>
            <PostInlineLink href={`/postwrite?postId=${encodeURIComponent(post.id)}`} tone="default">
              수정
            </PostInlineLink>
            <PostDeleteForm postId={post.id} action={deletePost} />
          </>
        ) : null}
      </div>
      <LoginRequiredDialog open={loginOpen} onOpenChange={setLoginOpen} onLogin={goLogin} />
      {open ? (
        <div className="flex flex-col gap-3 border-t border-[#e5e7eb] pt-3">
          {post.comments.length === 0 ? (
            <p className="text-sm text-[#6b7280]">아직 댓글이 없습니다.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {post.comments.map((comment) => (
                <PostCommentItem
                  key={comment.id}
                  authorName={comment.authorName}
                  body={comment.body}
                />
              ))}
            </ul>
          )}
          <PostCommentForm postId={post.id} action={createComment} />
        </div>
      ) : null}
    </article>
  );
}
