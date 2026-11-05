import Link from "next/link";
import { Suspense } from "react";
import PostCard from "@/component/organisms/PostCard";
import { readCurrentUser } from "@/lib/currentUser";
import { getCachedPosts } from "@/lib/postCache";

async function PostList() {
  const user = await readCurrentUser();
  const viewerId = user?.id ?? null;
  const posts = await getCachedPosts();
  if (posts.length === 0) {
    return <p className="text-sm text-[#6b7280]">아직 글이 없습니다.</p>;
  }
  return (
    <ul className="flex flex-col gap-4">
      {posts.map((post) => (
        <li key={post.id}>
          <PostCard post={post} canManage={post.authorId === viewerId} />
        </li>
      ))}
    </ul>
  );
}

export default function PostsPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 pb-16">
      <div className="flex items-center justify-between gap-4">
        <h1 className="!font-sans text-2xl font-bold text-[#111827]">글</h1>
        <Link
          href="/postwrite"
          className="inline-flex h-11 items-center rounded-xl bg-[#2563eb] px-4 text-sm font-semibold text-white"
        >
          글쓰기
        </Link>
      </div>
      <Suspense
        fallback={
          <p className="text-sm text-[#6b7280]">글 목록을 불러오는 중...</p>
        }
      >
        <PostList />
      </Suspense>
    </main>
  );
}
