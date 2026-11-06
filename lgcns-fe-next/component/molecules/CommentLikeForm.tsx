"use client";

import { useOptimistic } from "react";
import LikeSubmit from "../atoms/LikeSubmit";

function applyLike(current: { count: number; liked: boolean }, nextLiked: boolean) {
  if (nextLiked === current.liked) return current;
  return {
    liked: nextLiked,
    count: Math.max(0, current.count + (nextLiked ? 1 : -1)),
  };
}

export default function CommentLikeForm({
  postId,
  commentId,
  count,
  liked,
  action,
  onBeforeSubmit,
}: {
  postId: string;
  commentId: string;
  count: number;
  liked: boolean;
  action: (formData: FormData) => void | Promise<void>;
  onBeforeSubmit?: () => boolean;
}) {
  const [like, setLike] = useOptimistic({ count, liked }, applyLike);

  const handleLike = async (formData: FormData) => {
    if (onBeforeSubmit && !onBeforeSubmit()) return;
    formData.set("returnTo", `${window.location.pathname}${window.location.search}`);
    setLike(!like.liked);
    await action(formData);
  };

  return (
    <form action={handleLike}>
      <input type="hidden" name="postId" value={postId} />
      <input type="hidden" name="commentId" value={commentId} />
      <LikeSubmit count={like.count} liked={like.liked} compact />
    </form>
  );
}
