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
    <form action="/posts" className="flex flex-wrap items-center gap-3">
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
        className="h-[52px] min-w-0 flex-1 rounded-[10px] border border-[#d1d5db] bg-white px-4 text-[15px] text-[#111827] outline-none placeholder:text-[#9ca3af] focus:border-[#2563eb]"
      />
      <button
        type="submit"
        className="h-[52px] rounded-[12px] bg-[#2563eb] px-5 text-[16px] font-semibold text-white shadow-[0px_4px_6px_rgba(37,99,235,0.2)] hover:bg-[#1d4ed8]"
      >
        검색
      </button>
      {keyword ? (
        <Link
          href={postsListHref(1, sortOrder, "")}
          className="text-[14px] font-semibold text-[#2563eb]"
        >
          지우기
        </Link>
      ) : null}
    </form>
  );
}
