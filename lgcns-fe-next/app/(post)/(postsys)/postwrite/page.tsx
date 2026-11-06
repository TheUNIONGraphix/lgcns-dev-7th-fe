import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createPost, updatePost } from "@/actions/postActions";
import PostEditor from "@/component/organisms/PostEditor";
import { readCurrentUser } from "@/lib/currentUser";
import { getCachedPost } from "@/lib/postCache";
import { saveReturnTo } from "@/lib/returnToCookie";

function readPostId(
  value: string | string[] | undefined,
) {
  const raw = Array.isArray(value) ? value[0] : value;
  const postId = raw?.trim();
  return postId ? postId : undefined;
}

function writePath(postId?: string) {
  return postId
    ? `/postwrite?postId=${encodeURIComponent(postId)}`
    : "/postwrite";
}

async function PostWriteContent({
  searchParams,
}: {
  searchParams: Promise<{ postId?: string | string[] }>;
}) {
  const { postId: postIdParam } = await searchParams;
  const postId = readPostId(postIdParam);
  const user = await readCurrentUser();
  if (!user) {
    await saveReturnTo(writePath(postId));
    redirect("/login");
  }
  if (!postId) {
    return (
      <>
        <WriteHeader title="글 작성" backHref="/posts" backLabel="목록" />
        <PostEditor action={createPost} submitLabel="올리기" />
      </>
    );
  }

  const post = await getCachedPost(postId);
  if (!post) redirect("/posts");
  if (post.authorId !== user.id) redirect(`/postdetail/${postId}`);
  return (
    <>
      <WriteHeader
        title="글 수정"
        backHref={`/postdetail/${post.id}`}
        backLabel="글로 돌아가기"
      />
      <PostEditor
        action={updatePost}
        submitLabel="수정하기"
        initialHtml={post.body}
        postId={post.id}
      />
    </>
  );
}

function WriteHeader({
  title,
  backHref,
  backLabel,
}: {
  title: string;
  backHref: string;
  backLabel: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h1 className="!font-sans text-2xl font-bold text-foreground">{title}</h1>
      <Link href={backHref} className="text-sm font-medium text-[#2563eb]">
        {backLabel}
      </Link>
    </div>
  );
}

export default function PostWritePage({
  searchParams,
}: {
  searchParams: Promise<{ postId?: string | string[] }>;
}) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 pb-16">
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">에디터를 준비하는 중...</p>
        }
      >
        <PostWriteContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
