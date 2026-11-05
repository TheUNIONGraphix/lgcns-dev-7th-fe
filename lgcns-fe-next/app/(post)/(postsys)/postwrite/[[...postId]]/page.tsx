import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createPost, updatePost } from "@/actions/postActions";
import PostEditor from "@/component/organisms/PostEditor";
import { readCurrentUser } from "@/lib/currentUser";
import { getCachedPost } from "@/lib/postCache";

async function PostForm({ postId }: { postId?: string }) {
  const user = await readCurrentUser();
  const callbackPath = postId ? `/postwrite/${postId}` : "/postwrite";
  if (!user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackPath)}`);
  }
  if (!postId) return <PostEditor action={createPost} submitLabel="올리기" />;

  const post = await getCachedPost(postId);
  if (!post) redirect("/posts");
  if (post.authorId !== user.id) redirect(`/postdetail/${postId}`);
  return (
    <PostEditor
      action={updatePost}
      submitLabel="수정하기"
      initialHtml={post.body}
      postId={post.id}
    />
  );
}

export default async function PostWritePage({
  params,
}: {
  params: Promise<{ postId?: string[] }>;
}) {
  const { postId: segments } = await params;
  if (segments && segments.length > 1) redirect("/posts");
  const postId = segments?.[0];

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 pb-16">
      <div className="flex items-center justify-between gap-4">
        <h1 className="!font-sans text-2xl font-bold text-[#111827]">
          {postId ? "글 수정" : "글 작성"}
        </h1>
        <Link
          href={postId ? `/postdetail/${postId}` : "/posts"}
          className="text-sm font-medium text-[#2563eb]"
        >
          {postId ? "글로 돌아가기" : "목록"}
        </Link>
      </div>
      <Suspense
        fallback={
          <p className="text-sm text-[#6b7280]">
            {postId ? "글을 불러오는 중..." : "에디터를 준비하는 중..."}
          </p>
        }
      >
        <PostForm postId={postId} />
      </Suspense>
    </main>
  );
}
