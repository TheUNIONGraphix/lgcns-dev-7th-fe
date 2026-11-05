import Link from "next/link";
import { Suspense } from "react";
import Pagination from "@/component/organisms/Pagination";
import PostListSection from "@/component/organisms/PostListSection";
import PostLiveRefresh from "@/component/organisms/PostLiveRefresh";
import { getCachedPosts } from "@/lib/postCache";

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

function postsHref(page: number, sortOrder: "ASC" | "DESC") {
  return `/posts?page=${page}&sort=${sortOrder}`;
}

async function PostsContent({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[]; sort?: string | string[] }>;
}) {
  const { page, sort } = await searchParams;
  const pageNumber = readPage(page);
  const sortOrder = readSort(sort);
  const postList = getCachedPosts(pageNumber, sortOrder);

  return (
    <>
      <div className="flex gap-3 text-sm font-medium">
        <Link
          href={postsHref(1, "DESC")}
          aria-current={sortOrder === "DESC" ? "true" : undefined}
          className={sortOrder === "DESC" ? "text-foreground" : "text-[#2563eb]"}
        >
          최신순
        </Link>
        <Link
          href={postsHref(1, "ASC")}
          aria-current={sortOrder === "ASC" ? "true" : undefined}
          className={sortOrder === "ASC" ? "text-foreground" : "text-[#2563eb]"}
        >
          오래된순
        </Link>
      </div>
      <PostListSection sortOrder={sortOrder} postList={postList} />
      <Pagination sortOrder={sortOrder} postList={postList} />
    </>
  );
}

export default function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[]; sort?: string | string[] }>;
}) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 pb-16">
      <div className="flex items-center justify-between gap-4">
        <h1 className="!font-sans text-2xl font-bold text-foreground">글</h1>
        <Link
          href="/postwrite"
          className="inline-flex h-11 items-center rounded-xl bg-[#2563eb] px-4 text-sm font-semibold text-white"
        >
          글쓰기
        </Link>
      </div>
      <PostLiveRefresh />
      <Suspense fallback={<p className="text-sm text-muted-foreground">글 목록을 불러오는 중...</p>}>
        <PostsContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
