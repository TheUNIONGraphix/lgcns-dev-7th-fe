import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import PostCard from "@/component/organisms/PostCard";
import { readCurrentUser } from "@/lib/currentUser";
import { getCachedPost } from "@/lib/postCache";

async function PostDetail({ postId }: { postId: string }) {
  const user = await readCurrentUser();
  const post = await getCachedPost(postId);
  if (!post) notFound();
  return (
    <PostCard post={post} full canManage={post.authorId === user?.id} />
  );
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 pb-16">
      <div className="flex items-center justify-between gap-4">
        <h1 className="!font-sans text-2xl font-bold text-[#111827]">글</h1>
        <Link href="/posts" className="text-sm font-medium text-[#2563eb]">
          목록
        </Link>
      </div>
      <Suspense fallback={<p className="text-sm text-[#6b7280]">글을 불러오는 중...</p>}>
        <PostDetail postId={postId} />
      </Suspense>
    </main>
  );
}
