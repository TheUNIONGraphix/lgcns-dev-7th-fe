import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import PostEditor from "../components/PostEditor";
import { createPost, fetchPost, updatePost } from "../lib/posts";

export default function PostWrite() {
  const [params] = useSearchParams();
  const postId = params.get("postId")?.trim() || "";
  const navigate = useNavigate();
  const [initialHtml, setInitialHtml] = useState("");
  const [ready, setReady] = useState(!postId);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!postId) return;
    let cancelled = false;
    fetchPost(postId)
      .then((next) => {
        if (cancelled) return;
        if (!next.canManage) {
          navigate(`/postdetail/${postId}`, { replace: true });
          return;
        }
        setInitialHtml(next.post.body);
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) navigate("/posts", { replace: true });
      });
    return () => {
      cancelled = true;
    };
  }, [navigate, postId]);

  const submit = async (html: string) => {
    setPending(true);
    setError("");
    try {
      if (postId) {
        await updatePost(postId, html);
        navigate(`/postdetail/${postId}`);
        return;
      }
      const created = await createPost(html);
      navigate(`/postdetail/${created.id}`);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "글을 저장하지 못했습니다.");
      setPending(false);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 pb-16 text-[#111827]">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-sans text-2xl font-bold">{postId ? "글 수정" : "글 작성"}</h1>
        <Link
          to={postId ? `/postdetail/${postId}` : "/posts"}
          className="text-sm font-medium text-[#2563eb]"
        >
          {postId ? "글로 돌아가기" : "목록"}
        </Link>
      </div>
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      {ready ? (
        <PostEditor
          key={initialHtml}
          initialHtml={initialHtml}
          submitLabel={postId ? "수정하기" : "올리기"}
          pending={pending}
          onSubmit={submit}
        />
      ) : (
        <p className="text-sm text-[#6b7280]">글을 불러오는 중...</p>
      )}
    </main>
  );
}
