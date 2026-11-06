import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PostCard from "../components/PostCard";
import { fetchPost, type PostItem } from "../lib/posts";

export default function PostDetail() {
  const { postId = "" } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<PostItem | null>(null);
  const [liked, setLiked] = useState(false);
  const [canManage, setCanManage] = useState(false);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchPost(postId)
      .then((next) => {
        if (cancelled) return;
        setPost(next.post);
        setLiked(next.liked);
        setCanManage(next.canManage);
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "글을 불러오지 못했습니다.");
      });
    return () => {
      cancelled = true;
    };
  }, [postId, reloadKey]);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 pb-16 text-[#111827]">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-sans text-2xl font-bold">글</h1>
        <Link to="/posts" className="text-sm font-medium text-[#2563eb]">
          목록
        </Link>
      </div>
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      {!post && !error ? <p className="text-sm text-[#6b7280]">글을 불러오는 중...</p> : null}
      {post ? (
        <PostCard
          post={post}
          full
          liked={liked}
          canManage={canManage}
          onChange={() => setReloadKey((value) => value + 1)}
          onDeleted={() => navigate("/posts")}
        />
      ) : null}
    </main>
  );
}
