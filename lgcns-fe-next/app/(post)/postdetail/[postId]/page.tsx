import Link from "next/link";
import { Suspense } from "react";
import { Header, Main } from "@/components/ui/landmark";
import { notFound } from "next/navigation";
import PostCompose, { readCompose } from "@/app/(post)/PostCompose";
import PostCard from "@/component/organisms/PostCard";
import PostLiveRefresh from "@/component/organisms/PostLiveRefresh";
import { readCurrentUser } from "@/lib/currentUser";
import { commentIdsOf, findViewerLikedCommentIds, findViewerLikedPostIds, getCachedPost } from "@/lib/postCache";

async function PostDetail({
  params,
  searchParams,
}: {
  params: Promise<{ postId: string }>;
  searchParams: Promise<{ compose?: string | string[] }>;
}) {
  const [{ postId }, { compose: composeParam }] = await Promise.all([params, searchParams]);
  const [user, post] = await Promise.all([readCurrentUser(), getCachedPost(postId)]);
  if (!post) notFound();
  const [likedIds, likedCommentIds] = user
    ? await Promise.all([
        findViewerLikedPostIds(user.id, [post.id]),
        findViewerLikedCommentIds(user.id, commentIdsOf([post])),
      ])
    : [[], []];
  const compose = readCompose(composeParam);
  const closeHref = `/postdetail/${post.id}`;
  return (
    <>
      <PostCard
        post={post}
        full
        liked={likedIds.includes(post.id)}
        likedCommentIds={likedCommentIds}
        canManage={post.authorId === user?.id}
      />
      <Suspense fallback={null}>
        <PostCompose
          compose={compose}
          closeHref={closeHref}
          returnTo={
            compose ? `${closeHref}?compose=${encodeURIComponent(compose)}` : closeHref
          }
        />
      </Suspense>
    </>
  );
}

export default function PostDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ postId: string }>;
  searchParams: Promise<{ compose?: string | string[] }>;
}) {
  return (
    <Main className="min-h-dvh bg-[#f3f4f6] px-4 py-10">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <Header className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="!font-sans text-[28px] leading-[normal] font-bold text-[#111827]">
            글
          </h1>
          <p className="text-[14px] leading-[normal] text-[#6b7280]">
            글 내용을 확인해 보세요
          </p>
        </div>
        <Link href="/posts" className="text-[14px] font-semibold text-[#2563eb]">
          목록
        </Link>
      </Header>
      <PostLiveRefresh />
      <Suspense fallback={<p className="text-[14px] text-[#6b7280]">글을 불러오는 중...</p>}>
        <PostDetail params={params} searchParams={searchParams} />
      </Suspense>
      </div>
    </Main>
  );
}
