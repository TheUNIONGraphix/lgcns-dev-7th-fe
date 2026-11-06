import { Section } from "@/components/ui/landmark";
import CustomTitle from "../atoms/CustomTitle";
import PostCard from "./PostCard";
import { readCurrentUser } from "@/lib/currentUser";
import {
  commentIdsOf,
  findViewerLikedCommentIds,
  findViewerLikedPostIds,
  type PostListResponseType,
} from "@/lib/postCache";

export default async function PostListSection({
  sortOrder,
  keyword,
  postList,
}: {
  sortOrder: "ASC" | "DESC";
  keyword: string;
  postList: Promise<PostListResponseType>;
}) {
  const [user, data] = await Promise.all([readCurrentUser(), postList]);
  const viewerId = user?.id ?? null;
  const commentIds = commentIdsOf(data.posts);
  const [likedIds, likedCommentIds] = viewerId
    ? await Promise.all([
        findViewerLikedPostIds(
          viewerId,
          data.posts.map((post) => post.id),
        ),
        findViewerLikedCommentIds(viewerId, commentIds),
      ])
    : [[], []];
  const likedPostIds = new Set(likedIds);
  const sortLabel = sortOrder === "ASC" ? "오래된순" : "최신순";

  if (data.posts.length === 0) {
    return (
      <p className="text-[14px] leading-[normal] text-[#6b7280]">
        {keyword ? `"${keyword}"에 맞는 글이 없습니다.` : "아직 글이 없습니다."}
      </p>
    );
  }

  return (
    <Section className="flex flex-col gap-4">
      <CustomTitle
        TitleType="h2"
        className="text-left text-[14px] leading-[normal] font-normal text-[#6b7280]"
      >
        현재 페이지: {data.currentPage} | 정렬: {sortLabel} | 총 글 수: {data.totalItems}
        {keyword ? ` | 검색: ${keyword}` : ""}
      </CustomTitle>
      <ul className="flex flex-col gap-4">
        {data.posts.map((post) => (
          <li key={post.id}>
            <PostCard
              post={post}
              liked={likedPostIds.has(post.id)}
              likedCommentIds={likedCommentIds}
              canManage={post.authorId === viewerId}
            />
          </li>
        ))}
      </ul>
    </Section>
  );
}
