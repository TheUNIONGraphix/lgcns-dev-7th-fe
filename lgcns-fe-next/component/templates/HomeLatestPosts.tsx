import type { PostItem } from "@/lib/postCache";
import LatestPostFeed from "@/component/templates/LatestPostFeed";

export default async function HomeLatestPosts({
    posts,
    likedPostIds,
    likedCommentIds,
    viewerId,
}: {
    posts: PostItem[];
    likedPostIds: string[];
    likedCommentIds: string[];
    viewerId: string | null;
}) {
    return <LatestPostFeed posts={posts} likedPostIds={likedPostIds} likedCommentIds={likedCommentIds} viewerId={viewerId} />;
}