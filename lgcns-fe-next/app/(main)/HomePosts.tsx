import HomeLatestPosts from "@/component/templates/HomeLatestPosts";
import { readCurrentUser } from "@/lib/currentUser";
import {
  commentIdsOf,
  findViewerLikedCommentIds,
  findViewerLikedPostIds,
  getCachedPosts,
} from "@/lib/postCache";

export default async function HomePosts() {
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
