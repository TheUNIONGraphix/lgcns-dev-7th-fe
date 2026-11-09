import { Suspense } from "react";
import { Main } from "@/components/ui/landmark";
import HeroSection from "@/component/templates/HeroSection";
import HomeLatestPosts from "@/component/templates/HomeLatestPosts";
import { readCurrentUser } from "@/lib/currentUser";
import {
  commentIdsOf,
  findViewerLikedCommentIds,
  findViewerLikedPostIds,
  getCachedPosts,
} from "@/lib/postCache";

async function HomePosts() {
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
    <HomeLatestPosts
      posts={data.posts}
      likedPostIds={likedPostIds}
      likedCommentIds={likedCommentIds}
      viewerId={viewerId}
    />
  );
}

export default function Home() {
  return (
    <Main>
      <HeroSection />
      <Suspense
        fallback={
          <p className="px-4 py-10 text-[14px] text-[#6b7280]">최신 글을 불러오는 중...</p>
        }
      >
        <HomePosts />
      </Suspense>
    </Main>
  );
}
