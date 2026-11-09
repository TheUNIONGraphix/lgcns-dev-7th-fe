import { redirect } from "next/navigation";
import { createPost, updatePost } from "@/actions/postActions";
import PostWriteSheet from "@/components/templates/PostWriteSheet";
import { readCurrentUser } from "@/lib/currentUser";
import { getCachedPost } from "@/lib/postCache";
import { REMEMBER_PATH } from "@/lib/returnTo";

export function readCompose(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const compose = raw?.trim();
  return compose ? compose : undefined;
}

export default async function PostCompose({
  compose,
  closeHref,
  returnTo,
}: {
  compose?: string;
  closeHref: string;
  returnTo: string;
}) {
  if (!compose) return null;

  const user = await readCurrentUser();
  if (!user) {
    const params = new URLSearchParams({ returnTo });
    redirect(`${REMEMBER_PATH}?${params.toString()}`);
  }

  if (compose === "new") {
    return (
      <PostWriteSheet
        title="글 작성"
        description="내용을 작성하고 올려 주세요."
        closeHref={closeHref}
        action={createPost}
        submitLabel="올리기"
      />
    );
  }

  const post = await getCachedPost(compose);
  if (!post) redirect(closeHref);
  if (post.authorId !== user.id) redirect(`/postdetail/${post.id}`);

  return (
    <PostWriteSheet
      title="글 수정"
      description="내용을 수정하고 저장해 주세요."
      closeHref={closeHref}
      action={updatePost}
      submitLabel="수정하기"
      initialHtml={post.body}
      postId={post.id}
    />
  );
}
