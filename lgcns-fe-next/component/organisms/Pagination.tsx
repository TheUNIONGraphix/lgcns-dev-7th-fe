import Link from "next/link";
import { postsListHref, type PostListResponseType } from "@/lib/postCache";

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
    <nav aria-label="글 목록 페이지" className="flex items-center justify-between gap-3">
      {hasPreviousPage ? (
        <Link
          href={postsListHref(currentPage - 1, sortOrder, keyword)}
          className="text-sm font-medium text-[#2563eb]"
        >
          이전
        </Link>
      ) : (
        <span className="text-sm font-medium text-[#9ca3af]">이전</span>
      )}
      <ul className="flex flex-wrap items-center justify-center gap-2">
        {Array.from({ length: totalPages }, (_, index) => {
          const page = index + 1;
          const current = page === currentPage;
          return (
            <li key={page}>
              {current ? (
                <span aria-current="page" className="text-sm font-semibold text-foreground">
                  {page}
                </span>
              ) : (
                <Link
                  href={postsListHref(page, sortOrder, keyword)}
                  className="text-sm font-medium text-[#2563eb]"
                >
                  {page}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
      {hasNextPage ? (
        <Link
          href={postsListHref(currentPage + 1, sortOrder, keyword)}
          className="text-sm font-medium text-[#2563eb]"
        >
          다음
        </Link>
      ) : (
        <span className="text-sm font-medium text-[#9ca3af]">다음</span>
      )}
    </nav>
  );
}
