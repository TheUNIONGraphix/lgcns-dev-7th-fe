import { Suspense } from "react";
import HeroSection from "@/component/templates/HeroSection";
import LatestPostFeed from "@/component/templates/LatestPostFeed";
import { readCurrentUser } from "@/lib/currentUser";
import {
  commentIdsOf,
  findViewerLikedCommentIds,
  findViewerLikedPostIds,
  getCachedPosts,
} from "@/lib/postCache";

async function HomeLatestPosts() {
  const postList = getCachedPosts(1, "DESC");
  const [user, data] = await Promise.all([readCurrentUser(), postList]);
  const viewerId = user?.id ?? null;
  const commentIds = commentIdsOf(data.posts);
  const [likedPostIds, likedCommentIds] = viewerId
    ? await Promise.all([
        findViewerLikedPostIds(
          viewerId,
          data.posts.map((post) => post.id),
        ),
        findViewerLikedCommentIds(viewerId, commentIds),
      ])
    : [[], []];

  return (
    <LatestPostFeed
      posts={data.posts}
      likedPostIds={likedPostIds}
      likedCommentIds={likedCommentIds}
      viewerId={viewerId}
    />
  );
}

export default function Home() {
  return (
    <main className="min-h-dvh bg-[#f3f4f6]">
      <HeroSection />
      <Suspense fallback={<p className="px-4 py-10 text-[14px] text-[#6b7280]">최신 글을 불러오는 중...</p>}>
        <HomeLatestPosts />
      </Suspense>
    </main>
  );
}
