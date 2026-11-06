import Link from "next/link";
import type { PostItem } from "@/lib/postCache";
import PostCard from "../organisms/PostCard";

export default function LatestPostFeed({
  posts,
  likedPostIds,
  likedCommentIds,
  viewerId,
}: {
  posts: PostItem[];
  likedPostIds: string[];
  likedCommentIds: string[];
  viewerId: string | null;
}) {
  const liked = new Set(likedPostIds);

  return (
    <section className="px-4 pt-10 pb-16">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <header className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="!font-sans text-[28px] leading-[normal] font-bold text-[#111827]">
              최신 글
            </h2>
            <p className="text-[14px] leading-[normal] text-[#6b7280]">
              최근에 올라온 글을 피드에서 확인해 보세요
            </p>
          </div>
          <Link href="/posts" className="text-[14px] font-semibold text-[#2563eb]">
            전체 보기
          </Link>
        </header>
        {posts.length === 0 ? (
          <p className="text-[14px] leading-[normal] text-[#6b7280]">아직 글이 없습니다.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {posts.map((post) => (
              <li key={post.id}>
                <PostCard
                  post={post}
                  liked={liked.has(post.id)}
                  likedCommentIds={likedCommentIds}
                  canManage={post.authorId === viewerId}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
