import PostPageNav from "@/component/molecules/PostPageNav";
import type { PostListResponseType } from "@/lib/postCache";

export default async function Pagination({
  sortOrder,
  keyword,
  postList,
}: {
  sortOrder: "ASC" | "DESC";
  keyword: string;
  postList: Promise<PostListResponseType>;
}) {
  const { currentPage, totalPages, hasNextPage, hasPreviousPage } = await postList;
  if (totalPages <= 1) return null;

  return (
    <PostPageNav
      currentPage={currentPage}
      totalPages={totalPages}
      hasNextPage={hasNextPage}
      hasPreviousPage={hasPreviousPage}
      sortOrder={sortOrder}
      keyword={keyword}
    />
  );
}
