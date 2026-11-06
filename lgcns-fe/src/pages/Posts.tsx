import { useEffect, useState } from "react";
import { Form, Link, useSearchParams } from "react-router-dom";
import PostCard from "../components/PostCard";
import { fetchPosts, type PostListData } from "../lib/posts";

function readPage(value: string | null) {
  const page = Number(value);
  if (!Number.isInteger(page) || page < 1) return 1;
  return page;
}

export default function Posts() {
  const [params] = useSearchParams();
  const page = readPage(params.get("page"));
  const sort = params.get("sort") === "ASC" ? "ASC" : "DESC";
  const keyword = (params.get("q") ?? "").trim().replace(/\s+/g, " ").slice(0, 100);
  const [data, setData] = useState<PostListData | null>(null);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchPosts(page, sort, keyword)
      .then((next) => {
        if (!cancelled) setData(next);
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "글을 불러오지 못했습니다.");
      });
    return () => {
      cancelled = true;
    };
  }, [page, sort, keyword, reloadKey]);

  const href = (nextPage: number, nextSort: "ASC" | "DESC") => {
    const next = new URLSearchParams({
      page: String(nextPage),
      sort: nextSort,
    });
    if (keyword) next.set("q", keyword);
    return `/posts?${next.toString()}`;
  };

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 pb-16 text-[#111827]">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-sans text-2xl font-bold">글</h1>
        <Link
          to="/postwrite"
          className="inline-flex h-11 items-center rounded-xl bg-[#2563eb] px-4 text-sm font-semibold text-white"
        >
          글쓰기
        </Link>
      </div>
      <Form className="flex flex-wrap items-center gap-2">
        <input type="hidden" name="sort" value={sort} />
        <label htmlFor="post-keyword" className="sr-only">
          키워드
        </label>
        <input
          key={keyword}
          id="post-keyword"
          name="q"
          defaultValue={keyword}
          maxLength={100}
          placeholder="글 내용 또는 작성자"
          className="h-11 min-w-0 flex-1 rounded-xl border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-[#2563eb]"
        />
        <button
          type="submit"
          className="h-11 rounded-xl bg-[#111827] px-4 text-sm font-semibold text-white"
        >
          검색
        </button>
        {keyword ? (
          <Link to={`/posts?page=1&sort=${sort}`} className="text-sm font-medium text-[#2563eb]">
            지우기
          </Link>
        ) : null}
      </Form>
      <div className="flex gap-3 text-sm font-medium">
        <Link to={href(1, "DESC")} className={sort === "DESC" ? "text-[#111827]" : "text-[#2563eb]"}>
          최신순
        </Link>
        <Link to={href(1, "ASC")} className={sort === "ASC" ? "text-[#111827]" : "text-[#2563eb]"}>
          오래된순
        </Link>
      </div>
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      {!data ? <p className="text-sm text-[#6b7280]">글 목록을 불러오는 중...</p> : null}
      {data && data.posts.length === 0 ? (
        <p className="text-sm text-[#6b7280]">
          {keyword ? `"${keyword}"에 맞는 글이 없습니다.` : "아직 글이 없습니다."}
        </p>
      ) : null}
      {data && data.posts.length > 0 ? (
        <section className="flex flex-col gap-4">
          <h2 className="text-left text-sm font-medium text-[#6b7280]">
            현재 페이지: {data.currentPage} | 정렬: {sort === "ASC" ? "오래된순" : "최신순"} | 총 글 수: {data.totalItems}
            {keyword ? ` | 검색: ${keyword}` : ""}
          </h2>
          <ul className="flex flex-col gap-4">
            {data.posts.map((post) => (
              <li key={post.id}>
                <PostCard
                  post={post}
                  liked={data.likedPostIds.includes(post.id)}
                  canManage={post.authorId === data.viewerId}
                  onChange={() => setReloadKey((value) => value + 1)}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {data && data.totalPages > 1 ? (
        <nav aria-label="글 목록 페이지" className="flex items-center justify-between gap-3">
          {data.hasPreviousPage ? (
            <Link to={href(data.currentPage - 1, sort)} className="text-sm font-medium text-[#2563eb]">
              이전
            </Link>
          ) : (
            <span className="text-sm font-medium text-[#9ca3af]">이전</span>
          )}
          <ul className="flex flex-wrap items-center justify-center gap-2">
            {Array.from({ length: data.totalPages }, (_, index) => {
              const item = index + 1;
              return (
                <li key={item}>
                  {item === data.currentPage ? (
                    <span aria-current="page" className="text-sm font-semibold">
                      {item}
                    </span>
                  ) : (
                    <Link to={href(item, sort)} className="text-sm font-medium text-[#2563eb]">
                      {item}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
          {data.hasNextPage ? (
            <Link to={href(data.currentPage + 1, sort)} className="text-sm font-medium text-[#2563eb]">
              다음
            </Link>
          ) : (
            <span className="text-sm font-medium text-[#9ca3af]">다음</span>
          )}
        </nav>
      ) : null}
    </main>
  );
}
