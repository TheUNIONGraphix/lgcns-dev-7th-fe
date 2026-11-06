import Link from "next/link";
import { Suspense } from "react";
import { Header, Main } from "@/components/ui/landmark";
import PostCompose, { readCompose } from "@/app/(post)/PostCompose";
import PostComposeLink from "@/component/molecules/PostComposeLink";
import PostSearchForm from "@/component/molecules/PostSearchForm";
import Pagination from "@/component/organisms/Pagination";
import PostListSection from "@/component/organisms/PostListSection";
import PostLiveRefresh from "@/component/organisms/PostLiveRefresh";
import { getCachedPosts, normalizePostKeyword, postsListHref } from "@/lib/postCache";

function readPage(page: string | string[] | undefined) {
  const raw = Array.isArray(page) ? page[0] : page;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1) return 1;
  return value;
}

function readSort(sort: string | string[] | undefined): "ASC" | "DESC" {
  const raw = Array.isArray(sort) ? sort[0] : sort;
  return raw === "ASC" ? "ASC" : "DESC";
}

function readKeyword(keyword: string | string[] | undefined) {
  const raw = Array.isArray(keyword) ? keyword[0] : keyword;
  return normalizePostKeyword(raw ?? "");
}

async function PostsContent({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string | string[];
    sort?: string | string[];
    q?: string | string[];
    compose?: string | string[];
  }>;
}) {
  const { page, sort, q, compose: composeParam } = await searchParams;
  const pageNumber = readPage(page);
  const sortOrder = readSort(sort);
  const keyword = readKeyword(q);
  const compose = readCompose(composeParam);
  const closeHref = postsListHref(pageNumber, sortOrder, keyword);
  const postList = getCachedPosts(pageNumber, sortOrder, keyword);

  return (
    <>
      <PostSearchForm sortOrder={sortOrder} keyword={keyword} />
      <div className="flex gap-2">
        <Link
          href={postsListHref(1, "DESC", keyword)}
          aria-current={sortOrder === "DESC" ? "page" : undefined}
          className={
            sortOrder === "DESC"
              ? "inline-flex h-9 items-center rounded-[10px] bg-[#2563eb] px-3 text-[13px] font-semibold text-white"
              : "inline-flex h-9 items-center rounded-[10px] border border-[#d1d5db] bg-white px-3 text-[13px] font-semibold text-[#374151]"
          }
        >
          최신순
        </Link>
        <Link
          href={postsListHref(1, "ASC", keyword)}
          aria-current={sortOrder === "ASC" ? "page" : undefined}
          className={
            sortOrder === "ASC"
              ? "inline-flex h-9 items-center rounded-[10px] bg-[#2563eb] px-3 text-[13px] font-semibold text-white"
              : "inline-flex h-9 items-center rounded-[10px] border border-[#d1d5db] bg-white px-3 text-[13px] font-semibold text-[#374151]"
          }
        >
          오래된순
        </Link>
      </div>
      <PostListSection sortOrder={sortOrder} keyword={keyword} postList={postList} />
      <Pagination sortOrder={sortOrder} keyword={keyword} postList={postList} />
      <Suspense fallback={null}>
        <PostCompose
          compose={compose}
          closeHref={closeHref}
          returnTo={
            compose ? `${closeHref}&compose=${encodeURIComponent(compose)}` : closeHref
          }
        />
      </Suspense>
    </>
  );
}

export default function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string | string[];
    sort?: string | string[];
    q?: string | string[];
    compose?: string | string[];
  }>;
}) {
  return (
    <Main className="min-h-dvh bg-[#f3f4f6] px-4 py-10">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <Header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="!font-sans text-[28px] leading-[normal] font-bold text-[#111827]">
            글
          </h1>
          <p className="text-[14px] leading-[normal] text-[#6b7280]">
            작성된 글을 확인해 보세요
          </p>
        </div>
        <Suspense
          fallback={
            <Link
              href="/posts?compose=new"
              className="inline-flex h-14 items-center justify-center rounded-[12px] bg-[#2563eb] px-5 text-[16px] font-semibold text-white shadow-[0px_4px_6px_rgba(37,99,235,0.2)]"
            >
              글쓰기
            </Link>
          }
        >
          <PostComposeLink />
        </Suspense>
      </Header>
      <PostLiveRefresh />
      <Suspense fallback={<p className="text-[14px] text-[#6b7280]">글 목록을 불러오는 중...</p>}>
        <PostsContent searchParams={searchParams} />
      </Suspense>
      </div>
    </Main>
  );
}
