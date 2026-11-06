import { Suspense } from "react";
import { Main } from "@/components/ui/landmark";
import { redirect } from "next/navigation";
import { readCompose } from "@/app/(post)/PostCompose";

async function PostWriteRedirect({
  searchParams,
}: {
  searchParams: Promise<{ postId?: string | string[] }>;
}) {
  const { postId } = await searchParams;
  const compose = readCompose(postId) ?? "new";
  redirect(`/posts?compose=${encodeURIComponent(compose)}`);
}

export default function PostWritePage({
  searchParams,
}: {
  searchParams: Promise<{ postId?: string | string[] }>;
}) {
  return (
    <Main className="flex min-h-dvh items-center justify-center bg-[#f3f4f6] px-4 py-10">
      <Suspense fallback={<p className="text-[14px] text-[#6b7280]">글쓰기 창을 여는 중...</p>}>
        <PostWriteRedirect searchParams={searchParams} />
      </Suspense>
    </Main>
  );
}
