import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import PostCard from "@/component/organisms/PostCard";
import PostLiveRefresh from "@/component/organisms/PostLiveRefresh";
import { readCurrentUser } from "@/lib/currentUser";
import { findViewerLikedPostIds, getCachedPost } from "@/lib/postCache";

async function PostDetail({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const [user, post] = await Promise.all([readCurrentUser(), getCachedPost(postId)]);
  if (!post) notFound();
  const likedIds = user ? await findViewerLikedPostIds(user.id, [post.id]) : [];
  return (
    <PostCard
      post={post}
      full
      liked={likedIds.includes(post.id)}
      canManage={post.authorId === user?.id}
    />
  );
}

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 pb-16">
      <div className="flex items-center justify-between gap-4">
        <h1 className="!font-sans text-2xl font-bold text-foreground">글</h1>
        <Link href="/posts" className="text-sm font-medium text-[#2563eb]">
          목록
        </Link>
      </div>
      <PostLiveRefresh />
      <Suspense fallback={<p className="text-sm text-muted-foreground">글을 불러오는 중...</p>}>
        <PostDetail params={params} />
      </Suspense>
    </main>
  );
}
