import CustomTitle from "../atoms/CustomTitle";
import PostCard from "./PostCard";
import { readCurrentUser } from "@/lib/currentUser";
import type { PostListResponseType } from "@/lib/postCache";

export default async function PostListSection({
  sortOrder,
  postList,
}: {
  sortOrder: "ASC" | "DESC";
  postList: Promise<PostListResponseType>;
}) {
  const [user, data] = await Promise.all([readCurrentUser(), postList]);
  const viewerId = user?.id ?? null;
  const sortLabel = sortOrder === "ASC" ? "오래된순" : "최신순";

  if (data.posts.length === 0) {
    return <p className="text-sm text-muted-foreground">아직 글이 없습니다.</p>;
  }

  return (
    <section className="flex flex-col gap-4">
      <CustomTitle
        TitleType="h2"
        className="text-left text-sm font-medium text-muted-foreground"
      >
        현재 페이지: {data.currentPage} | 정렬: {sortLabel} | 총 글 수: {data.totalItems}
      </CustomTitle>
      <ul className="flex flex-col gap-4">
        {data.posts.map((post) => (
          <li key={post.id}>
            <PostCard post={post} canManage={post.authorId === viewerId} />
          </li>
        ))}
      </ul>
    </section>
  );
}
