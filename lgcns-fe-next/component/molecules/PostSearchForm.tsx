import Link from "next/link";
import { postsListHref } from "@/lib/postCache";

export default function PostSearchForm({
  sortOrder,
  keyword,
}: {
  sortOrder: "ASC" | "DESC";
  keyword: string;
}) {
  return (
    <form action="/posts" className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="sort" value={sortOrder} />
      <label htmlFor="post-keyword" className="sr-only">
        키워드
      </label>
      <input
        id="post-keyword"
        name="q"
        defaultValue={keyword}
        maxLength={100}
        placeholder="글 내용 또는 작성자"
        className="h-11 min-w-0 flex-1 rounded-xl border border-[#d1d5db] bg-white px-3 text-sm text-foreground outline-none focus:border-[#2563eb]"
      />
      <button
        type="submit"
        className="h-11 rounded-xl bg-[#111827] px-4 text-sm font-semibold text-white"
      >
        검색
      </button>
      {keyword ? (
        <Link
          href={postsListHref(1, sortOrder, "")}
          className="text-sm font-medium text-[#2563eb]"
        >
          지우기
        </Link>
      ) : null}
    </form>
  );
}
