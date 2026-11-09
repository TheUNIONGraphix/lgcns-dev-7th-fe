import PostPageNav from "@/component/molecules/PostPageNav";
import PostCard from "@/component/organisms/PostCard";
import type { PostListShellProps } from "@/component/organisms/postListShell";
import { Section } from "@/components/ui/landmark";

export default function PostPaginataionWrapper({
  posts,
  pageNumber,
  sortOrder,
  keyword,
}: PostListShellProps) {
  const sortLabel = sortOrder === "ASC" ? "오래된순" : "최신순";

  return (
    <>
      {posts.posts.length === 0 ? (
        <p className="text-[14px] leading-[normal] text-[#6b7280]">
          {keyword ? `"${keyword}"에 맞는 글이 없습니다.` : "아직 글이 없습니다."}
        </p>
      ) : (
        <Section className={posts.totalPages > 1 ? "flex flex-col gap-4 pb-24" : "flex flex-col gap-4"}>
          <p className="text-left text-[14px] leading-[normal] font-normal text-[#6b7280]">
            현재 페이지: {posts.currentPage || pageNumber} | 정렬: {sortLabel} | 총 글 수:{" "}
            {posts.totalItems}
            {keyword ? ` | 검색: ${keyword}` : ""}
          </p>
          <ul className="flex flex-col gap-4">
            {posts.posts.map((post) => (
              <li key={post.id}>
                <PostCard post={post} />
              </li>
            ))}
          </ul>
        </Section>
      )}
      {posts.totalPages > 1 ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#e5e7eb] bg-[#f3f4f6]/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto w-full max-w-3xl">
            <PostPageNav
              currentPage={posts.currentPage || pageNumber}
              totalPages={posts.totalPages}
              hasNextPage={posts.hasNextPage}
              hasPreviousPage={posts.hasPreviousPage}
              sortOrder={sortOrder}
              keyword={keyword}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
